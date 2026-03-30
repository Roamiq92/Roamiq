export const runtime = "edge";

interface OnboardingData {
  destination: string;
  departureCity: string;
  startDate: string;
  endDate: string;
  travelers: string;
  budget: string;
  interests: string[];
  pace: string;
}

const BUDGET_MAP: Record<string, string> = {
  low: "economico sotto €80/giorno",
  mid: "medio €80-200/giorno",
  high: "comfort €200-400/giorno",
  luxury: "lusso oltre €400/giorno",
};

const PACE_MAP: Record<string, string> = {
  lento: "rilassato 3 attività/giorno",
  equilibrato: "equilibrato 4-5 attività/giorno",
  intenso: "intenso 6+ attività/giorno",
};

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // Controllo chiave API
  if (!apiKey || !apiKey.startsWith("sk-ant-")) {
    return Response.json(
      { error: `API key non valida o mancante. Valore: ${apiKey ? "presente ma formato errato" : "assente"}` },
      { status: 500 }
    );
  }

  let body: OnboardingData;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Body non valido" }, { status: 400 });
  }

  if (!body.destination || !body.startDate || !body.endDate) {
    return Response.json({ error: "Dati mancanti: destination, startDate o endDate" }, { status: 400 });
  }

  const days = Math.ceil(
    (new Date(body.endDate).getTime() - new Date(body.startDate).getTime()) / 86400000
  );

  const prompt = `Sei ROAMIQ, AI travel planner italiano. Genera un itinerario dettagliato e coinvolgente.

VIAGGIO: ${body.departureCity} → ${body.destination} | ${days} giorni | ${body.startDate} → ${body.endDate}
GRUPPO: ${body.travelers} | BUDGET: ${BUDGET_MAP[body.budget] ?? body.budget} | RITMO: ${PACE_MAP[body.pace] ?? body.pace}
INTERESSI: ${body.interests.join(", ")}

Rispondi ESCLUSIVAMENTE con JSON valido, zero testo prima o dopo:

{
  "destination": "${body.destination}",
  "country": "nome paese",
  "emoji": "emoji bandiera paese",
  "summary": "frase evocativa e ispirazionale di 1 riga su questo viaggio specifico",
  "totalCostMin": 450,
  "totalCostMax": 750,
  "days": [
    {
      "day": 1,
      "date": "${body.startDate}",
      "theme": "Arrivo e prime scoperte",
      "activities": [
        {
          "time": "10:00",
          "name": "nome attività reale",
          "description": "descrizione coinvolgente con dettagli storici/culturali autentici",
          "duration": "2h",
          "priceMin": 0,
          "priceMax": 15,
          "category": "cultura",
          "tip": "consiglio pratico insider che i turisti non sanno",
          "bookingRequired": false
        }
      ]
    }
  ],
  "hotels": [
    {
      "name": "nome hotel reale",
      "stars": 3,
      "zone": "quartiere specifico",
      "pricePerNight": 90,
      "why": "perché è perfetto per questo profilo viaggiatore"
    }
  ],
  "localTips": [
    "consiglio autentico 1",
    "consiglio autentico 2",
    "consiglio autentico 3"
  ],
  "bestFor": "descrizione di chi è perfetto questo viaggio"
}

IMPORTANTE: genera TUTTI i ${days} giorni, ognuno con almeno 4 attività reali e specifiche di ${body.destination}. Prezzi in euro. Solo JSON.`;

  let claudeRes: Response;
  try {
    claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 3000,
        messages: [{ role: "user", content: prompt }],
      }),
    });
  } catch (fetchErr) {
    return Response.json(
      { error: `Fetch verso Anthropic fallito: ${String(fetchErr)}` },
      { status: 500 }
    );
  }

  if (!claudeRes.ok) {
    const errText = await claudeRes.text();
    return Response.json(
      { error: `Anthropic ha risposto con errore ${claudeRes.status}: ${errText}` },
      { status: 500 }
    );
  }

  const claudeData = await claudeRes.json();
  const rawText: string = claudeData.content?.[0]?.text ?? "";

  if (!rawText) {
    return Response.json(
      { error: "Anthropic ha risposto ma il testo è vuoto" },
      { status: 500 }
    );
  }

  // Parse JSON
  let itinerary;
  try {
    const clean = rawText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    itinerary = JSON.parse(clean);
  } catch {
    const match = rawText.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        itinerary = JSON.parse(match[0]);
      } catch (e2) {
        return Response.json(
          { error: `JSON parse fallito. Risposta AI: ${rawText.slice(0, 200)}` },
          { status: 500 }
        );
      }
    } else {
      return Response.json(
        { error: `Nessun JSON trovato nella risposta. Risposta AI: ${rawText.slice(0, 200)}` },
        { status: 500 }
      );
    }
  }

  // Salva su Supabase (non-bloccante)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const dbRes = await fetch(`${supabaseUrl}/rest/v1/trips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Prefer": "return=representation",
        },
        body: JSON.stringify({
          destination: body.destination,
          start_date: body.startDate,
          end_date: body.endDate,
          travelers: body.travelers,
          budget: body.budget,
          interests: body.interests,
          pace: body.pace,
          itinerary,
          status: "generated",
        }),
      });

      if (dbRes.ok) {
        const saved = await dbRes.json();
        const tripId = Array.isArray(saved) ? saved[0]?.id : saved?.id;
        if (tripId) {
          return Response.json({ tripId, itinerary });
        }
      }
    } catch {
      // Supabase fallito ma non blocca
    }
  }

  return Response.json({ tripId: "demo", itinerary });
}
