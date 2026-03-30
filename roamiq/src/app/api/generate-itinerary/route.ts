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
  cuisines: string[];
  dietaryNeeds: string[];
  diningBudget: string;
}

const BUDGET_MAP: Record<string, string> = {
  low: "economico <€80/gg", mid: "medio €80-200/gg",
  high: "comfort €200-400/gg", luxury: "lusso >€400/gg",
};
const PACE_MAP: Record<string, string> = {
  lento: "3 attività/giorno", equilibrato: "4 attività/giorno", intenso: "5+ attività/giorno",
};
const DINING_MAP: Record<string, string> = {
  street: "street food e mercati", casual: "trattorie e bistrot casual",
  restaurant: "ristoranti curati", fine: "fine dining e alta cucina",
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

  const dateArray = Array.from({ length: days }, (_, i) => {
    const d = new Date(body.startDate);
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  const foodPrefs = [
    body.cuisines?.length ? `cucine preferite: ${body.cuisines.join(", ")}` : "",
    body.dietaryNeeds?.length ? `esigenze: ${body.dietaryNeeds.join(", ")}` : "",
    body.diningBudget ? `tipo ristorazione: ${DINING_MAP[body.diningBudget] ?? body.diningBudget}` : "",
  ].filter(Boolean).join(" | ");

  const prompt = `Sei ROAMIQ travel planner. Genera un itinerario completo per ${days} giorni a ${body.destination}.

DATI:
- Partenza: ${body.departureCity} → ${body.destination}
- Date: ${dateArray.join(", ")}
- Gruppo: ${body.travelers}
- Budget: ${BUDGET_MAP[body.budget] ?? body.budget}
- Ritmo: ${PACE_MAP[body.pace] ?? body.pace}
- Interessi: ${body.interests?.slice(0,4).join(", ")}
- Preferenze cibo: ${foodPrefs || "nessuna specifica"}

ISTRUZIONI:
- Ogni giorno deve avere sia ATTIVITÀ che RISTORANTI (pranzo e cena)
- I ristoranti devono essere reali e specifici di ${body.destination}
- Rispetta le preferenze alimentari dell'utente
- Alterna tipi di ristorante (non sempre lo stesso stile)

Rispondi SOLO con JSON valido, nessun testo o markdown:

{
  "destination": "${body.destination}",
  "country": "nome paese",
  "emoji": "🏳️",
  "summary": "frase evocativa e ispirazionale",
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
          "description": "descrizione coinvolgente 1-2 frasi",
          "duration": "2h",
          "priceMin": 0,
          "priceMax": 15,
          "category": "cultura",
          "tip": "consiglio insider pratico",
          "bookingRequired": false,
          "type": "activity"
        },
        {
          "time": "13:00",
          "name": "nome ristorante reale",
          "description": "descrizione piatti e atmosfera",
          "duration": "1.5h",
          "priceMin": 15,
          "priceMax": 35,
          "category": "food",
          "tip": "cosa ordinare e quando prenotare",
          "bookingRequired": true,
          "type": "restaurant",
          "cuisine": "tipo cucina",
          "googleMapsQuery": "nome ristorante ${body.destination}"
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
      "why": "perché è perfetto per questo profilo",
      "googleHotelsQuery": "nome hotel ${body.destination}"
    }
  ],
  "localTips": ["tip autentico 1", "tip autentico 2", "tip autentico 3"],
  "bestFor": "per chi è perfetto questo viaggio"
}

Genera TUTTI i ${days} giorni. Ogni giorno: almeno 3 attività + pranzo + cena (5 item totali). Solo JSON.`;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
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

        const start = rawText.indexOf("{");
        const end = rawText.lastIndexOf("}");

        if (start === -1 || end === -1 || end <= start) {
          controller.enqueue(encoder.encode(JSON.stringify({ error: "Nessun JSON nella risposta AI" })));
          controller.close();
          return;
        }

        let itinerary;
        try {
          itinerary = JSON.parse(rawText.slice(start, end + 1));
        } catch {
          controller.enqueue(encoder.encode(JSON.stringify({ error: "JSON non valido nella risposta AI" })));
          controller.close();
          return;
        }

        // Salva su Supabase
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
        controller.enqueue(encoder.encode(JSON.stringify({ error: `Errore: ${String(err)}` })));
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { "Content-Type": "application/json" } });
}
