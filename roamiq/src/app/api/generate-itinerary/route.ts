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
  cuisines?: string[];
  dietaryNeeds?: string[];
  diningBudget?: string;
}

const BUDGET_MAP: Record<string, string> = {
  low: "economico <€80/gg", mid: "medio €80-200/gg",
  high: "comfort €200-400/gg", luxury: "lusso >€400/gg",
};
const PACE_MAP: Record<string, string> = {
  lento: "3 attività/giorno", equilibrato: "4 attività/giorno", intenso: "5+ attività/giorno",
};
const DINING_MAP: Record<string, string> = {
  street: "street food e mercati locali", casual: "trattorie e bistrot tipici",
  restaurant: "ristoranti curati con buone recensioni", fine: "ristoranti rinomati e fine dining",
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

  const foodInfo = [
    body.cuisines?.length ? `cucine: ${body.cuisines.join(", ")}` : "",
    body.dietaryNeeds?.filter(d => d !== "nessuna").length
      ? `dieta: ${body.dietaryNeeds?.filter(d => d !== "nessuna").join(", ")}` : "",
    body.diningBudget ? `stile: ${DINING_MAP[body.diningBudget] ?? body.diningBudget}` : "",
  ].filter(Boolean).join(" | ");

  const systemPrompt = `Sei un travel planner esperto. Quando generi itinerari:
- Usa SOLO ristoranti, hotel e locali che esistono realmente e hanno ottime recensioni
- MAI inventare nomi di posti
- Per nightlife: solo bar, pub e club veri - MAI sale giochi o bowling
- Per spa: solo centri benessere di qualità verificati
- Includi esperienze autentiche dei locals (mercati, artigiani, cucina di strada)
- Rispondi SEMPRE e SOLO con JSON valido, senza testo aggiuntivo`;

  const prompt = `Genera un itinerario di ${days} giorni a ${body.destination}.

Dati: da ${body.departureCity}, ${body.travelers}, ${BUDGET_MAP[body.budget] ?? body.budget}, ${PACE_MAP[body.pace] ?? body.pace}
Interessi: ${body.interests?.slice(0,4).join(", ") || "cultura, food"}
Cibo: ${foodInfo || "cucina locale tipica"}
Date: ${dateArray.join(", ")}

Usa la ricerca web per verificare che i ristoranti e i posti esistano davvero prima di includerli.

Poi rispondi con questo JSON (sostituisci con dati reali verificati):
{
  "destination": "${body.destination}",
  "country": "paese",
  "emoji": "🏳️",
  "summary": "frase evocativa 1 riga",
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
          "name": "nome posto REALE verificato",
          "description": "descrizione 1-2 frasi con contesto autentico",
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
          "name": "nome ristorante REALE verificato",
          "description": "piatti tipici e atmosfera",
          "duration": "1.5h",
          "priceMin": 15,
          "priceMax": 35,
          "category": "food",
          "tip": "cosa ordinare",
          "bookingRequired": true,
          "type": "restaurant",
          "cuisine": "tipo cucina"
        }
      ]
    }
  ],
  "hotels": [
    {
      "name": "nome hotel REALE verificato",
      "stars": 3,
      "zone": "quartiere",
      "pricePerNight": 90,
      "why": "perché consigliato per questo profilo"
    }
  ],
  "localTips": ["tip autentico 1", "tip autentico 2", "tip autentico 3"],
  "bestFor": "per chi è questo viaggio"
}

Genera TUTTI i ${days} giorni, ognuno con almeno 3 attività + pranzo + cena. Solo JSON.`;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Primo byte immediato → evita timeout Vercel 25s
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
            model: "claude-sonnet-4-6",
            max_tokens: 8000,
            system: systemPrompt,
            tools: [{
              type: "web_search_20250305",
              name: "web_search",
              max_uses: 4,
            }],
            messages: [{ role: "user", content: prompt }],
          }),
        });

        if (!claudeRes.ok) {
          const err = await claudeRes.text();
          controller.enqueue(encoder.encode(JSON.stringify({
            error: `Errore Claude ${claudeRes.status}: ${err.slice(0, 150)}`
          })));
          controller.close();
          return;
        }

        const claudeData = await claudeRes.json();

        // Estrai solo i blocchi di testo (ignora tool_use blocks)
        const textBlocks = (claudeData.content ?? [])
          .filter((b: { type: string }) => b.type === "text")
          .map((b: { text: string }) => b.text)
          .join("");

        if (!textBlocks) {
          controller.enqueue(encoder.encode(JSON.stringify({ error: "Risposta AI vuota" })));
          controller.close();
          return;
        }

        // Estrai JSON dalla risposta
        const start = textBlocks.indexOf("{");
        const end = textBlocks.lastIndexOf("}");

        if (start === -1 || end === -1 || end <= start) {
          controller.enqueue(encoder.encode(JSON.stringify({ error: "Nessun JSON trovato nella risposta" })));
          controller.close();
          return;
        }

        let itinerary;
        try {
          itinerary = JSON.parse(textBlocks.slice(start, end + 1));
        } catch {
          controller.enqueue(encoder.encode(JSON.stringify({ error: "JSON non valido" })));
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
