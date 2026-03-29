export const runtime = "edge";

/* ── Types ─────────────────────────────────────────────────── */
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
  low:    "economico (meno di €80/giorno)",
  mid:    "medio (€80–200/giorno)",
  high:   "comfort (€200–400/giorno)",
  luxury: "lusso (oltre €400/giorno)",
};

const PACE_MAP: Record<string, string> = {
  lento:       "rilassato (2–3 attività/giorno)",
  equilibrato: "equilibrato (4–5 attività/giorno)",
  intenso:     "intenso (6+ attività/giorno)",
};

function buildPrompt(data: OnboardingData): string {
  const days = Math.ceil(
    (new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / 86400000
  );

  return `Sei ROAMIQ, AI travel planner. Genera un itinerario JSON completo.

Viaggio: ${data.departureCity} → ${data.destination}, ${days} giorni
Partenza: ${data.startDate} | Ritorno: ${data.endDate}
Gruppo: ${data.travelers} | Budget: ${BUDGET_MAP[data.budget] ?? data.budget}
Ritmo: ${PACE_MAP[data.pace] ?? data.pace}
Interessi: ${data.interests.join(", ")}

Rispondi SOLO con JSON valido, nessun testo aggiuntivo:

{
  "destination": "${data.destination}",
  "country": "paese",
  "emoji": "🏳️",
  "summary": "descrizione evocativa del viaggio",
  "totalCostMin": 500,
  "totalCostMax": 800,
  "days": [
    {
      "day": 1,
      "date": "${data.startDate}",
      "theme": "tema del giorno",
      "activities": [
        {
          "time": "09:00",
          "name": "nome",
          "description": "descrizione breve",
          "duration": "2h",
          "priceMin": 0,
          "priceMax": 15,
          "category": "cultura",
          "tip": "consiglio insider",
          "bookingRequired": false
        }
      ]
    }
  ],
  "hotels": [
    {
      "name": "nome hotel",
      "stars": 3,
      "zone": "quartiere",
      "pricePerNight": 90,
      "why": "perché consigliato"
    }
  ],
  "localTips": ["tip 1", "tip 2", "tip 3"],
  "bestFor": "per chi è questo viaggio"
}

Genera tutti e ${days} giorni. Ogni giorno: 4 attività minimo. Tutto in italiano. Solo JSON.`;
}

export async function POST(req: Request) {
  try {
    const body: OnboardingData = await req.json();

    if (!body.destination || !body.startDate || !body.endDate) {
      return Response.json({ error: "Dati mancanti" }, { status: 400 });
    }

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4000,
        messages: [{ role: "user", content: buildPrompt(body) }],
      }),
    });

    if (!claudeRes.ok) {
      const err = await claudeRes.text();
      console.error("Claude error:", err);
      return Response.json({ error: "Errore AI" }, { status: 500 });
    }

    const claudeData = await claudeRes.json();
    const rawText: string = claudeData.content?.[0]?.text ?? "";

    if (!rawText) {
      return Response.json({ error: "Risposta AI vuota" }, { status: 500 });
    }

    // Parse JSON robusto
    let itinerary;
    try {
      const clean = rawText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      itinerary = JSON.parse(clean);
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        try { itinerary = JSON.parse(match[0]); }
        catch { return Response.json({ error: "Formato risposta non valido" }, { status: 500 }); }
      } else {
        return Response.json({ error: "Formato risposta non valido" }, { status: 500 });
      }
    }

    // Salva su Supabase via fetch (edge-compatible)
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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
        const dbData = await dbRes.json();
        const tripId = Array.isArray(dbData) ? dbData[0]?.id : dbData?.id;
        if (tripId) {
          return Response.json({ tripId, itinerary });
        }
      }
    } catch (dbErr) {
      console.error("Supabase error (non-fatal):", dbErr);
    }

    // Fallback senza salvataggio
    return Response.json({ tripId: "demo", itinerary });

  } catch (err) {
    console.error("Error:", err);
    return Response.json({ error: "Errore interno" }, { status: 500 });
  }
}
