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
  low: "economico <€80/gg", mid: "medio €80-200/gg",
  high: "comfort €200-400/gg", luxury: "lusso >€400/gg",
};
const PACE_MAP: Record<string, string> = {
  lento: "3 attività/giorno", equilibrato: "4 attività/giorno", intenso: "5 attività/giorno",
};

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY ?? "";
  if (!apiKey.startsWith("sk-ant-")) {
    return Response.json({ error: "API key mancante" }, { status: 500 });
  }

  let body: OnboardingData;
  try { body = await req.json(); }
  catch { return Response.json({ error: "Body non valido" }, { status: 400 }); }

  const days = Math.max(1, Math.min(7, Math.ceil(
    (new Date(body.endDate).getTime() - new Date(body.startDate).getTime()) / 86400000
  )));

  const activitiesCount = PACE_MAP[body.pace] ?? "4 attività/giorno";

  // Costruisci l'array di date
  const dateArray = Array.from({ length: days }, (_, i) => {
    const d = new Date(body.startDate);
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  const prompt = `Sei ROAMIQ travel planner. Genera un itinerario per ${days} giorni a ${body.destination}.
Dati: partenza ${body.departureCity}, gruppo ${body.travelers}, budget ${BUDGET_MAP[body.budget] ?? body.budget}, ritmo ${activitiesCount}, interessi: ${body.interests.slice(0, 3).join(", ")}.

Rispondi SOLO con JSON, niente altro testo o markdown.
Il JSON deve avere questa struttura esatta:

{
  "destination": "${body.destination}",
  "country": "nome paese",
  "emoji": "🏳️",
  "summary": "una frase evocativa sul viaggio",
  "totalCostMin": 400,
  "totalCostMax": 700,
  "days": [
    {
      "day": 1,
      "date": "${dateArray[0]}",
      "theme": "tema del giorno",
      "activities": [
        {
          "time": "09:00",
          "name": "nome posto reale",
          "description": "descrizione 1 frase",
          "duration": "2h",
          "priceMin": 0,
          "priceMax": 15,
          "category": "cultura",
          "tip": "consiglio pratico",
          "bookingRequired": false
        }
      ]
    }
  ],
  "hotels": [
    {
      "name": "nome hotel reale",
      "stars": 3,
      "zone": "quartiere",
      "pricePerNight": 90,
      "why": "perché consigliato"
    }
  ],
  "localTips": ["tip 1", "tip 2", "tip 3"],
  "bestFor": "per chi è questo viaggio"
}

REGOLE:
- Genera esattamente ${days} giorni con date: ${dateArray.join(", ")}
- Ogni giorno: esattamente 4 attività reali e specifiche di ${body.destination}
- L'emoji deve essere la bandiera del paese (es 🇪🇸 per Spagna)
- Solo JSON valido, nessun testo prima o dopo`;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Byte iniziale immediato → evita timeout Vercel 25s
      controller.enqueue(encoder.encode(" "));

      try {
        const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 6000,
            messages: [{ role: "user", content: prompt }],
          }),
        });

        if (!claudeRes.ok) {
          const err = await claudeRes.text();
          controller.enqueue(encoder.encode(JSON.stringify({ error: `Errore Claude ${claudeRes.status}: ${err.slice(0, 200)}` })));
          controller.close();
          return;
        }

        const claudeData = await claudeRes.json();
        const rawText: string = claudeData.content?.[0]?.text ?? "";

        if (!rawText) {
          controller.enqueue(encoder.encode(JSON.stringify({ error: "Risposta AI vuota" })));
          controller.close();
          return;
        }

        // Estrai JSON — trova la prima { e l'ultima }
        const start = rawText.indexOf("{");
        const end = rawText.lastIndexOf("}");

        if (start === -1 || end === -1 || end <= start) {
          controller.enqueue(encoder.encode(JSON.stringify({ error: "Nessun JSON trovato nella risposta" })));
          controller.close();
          return;
        }

        const jsonStr = rawText.slice(start, end + 1);

        let itinerary;
        try {
          itinerary = JSON.parse(jsonStr);
        } catch (parseErr) {
          controller.enqueue(encoder.encode(JSON.stringify({
            error: `JSON troncato o non valido. Token insufficienti? Lunghezza risposta: ${rawText.length}`
          })));
          controller.close();
          return;
        }

        // Salva su Supabase (non bloccante)
        let tripId = "demo";
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
              const id = Array.isArray(saved) ? saved[0]?.id : saved?.id;
              if (id) tripId = id;
            }
          } catch { /* non bloccante */ }
        }

        controller.enqueue(encoder.encode(JSON.stringify({ tripId, itinerary })));
        controller.close();

      } catch (err) {
        controller.enqueue(encoder.encode(JSON.stringify({ error: `Errore interno: ${String(err)}` })));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/json" },
  });
}
