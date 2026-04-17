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
  low: "economico sotto €80/giorno",
  mid: "medio €80-200/giorno",
  high: "comfort €200-400/giorno",
  luxury: "lusso oltre €400/giorno",
};
const PACE_MAP: Record<string, string> = {
  lento: "3 attività al giorno",
  equilibrato: "4-5 attività al giorno",
  intenso: "6+ attività al giorno",
};
const DINING_MAP: Record<string, string> = {
  street: "street food e mercati",
  casual: "trattorie tipiche",
  restaurant: "ristoranti curati",
  fine: "fine dining",
};

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY ?? "";
  if (!apiKey.startsWith("sk-ant-")) {
    return Response.json({ error: "API key mancante" }, { status: 500 });
  }

  let body: OnboardingData;
  try { body = await req.json(); }
  catch { return Response.json({ error: "Body non valido" }, { status: 400 }); }

  const days = Math.max(1, Math.min(5, Math.ceil(
    (new Date(body.endDate).getTime() - new Date(body.startDate).getTime()) / 86400000
  )));

  const dateArray = Array.from({ length: days }, (_, i) => {
    const d = new Date(body.startDate);
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  const foodInfo = [
    body.cuisines?.length ? `cucine preferite: ${body.cuisines.join(", ")}` : "",
    body.dietaryNeeds?.filter(d => d !== "nessuna").length
      ? `esigenze: ${body.dietaryNeeds?.filter(d => d !== "nessuna").join(", ")}` : "",
    body.diningBudget ? `stile: ${DINING_MAP[body.diningBudget] ?? body.diningBudget}` : "",
  ].filter(Boolean).join(" | ");

  const travelers = body.travelers;
  const numPeople = travelers === "coppia" ? 2 : travelers === "famiglia" ? 3 : travelers === "amici" ? 3 : 1;

  const systemPrompt = `Sei un travel planner esperto. Rispondi SEMPRE e SOLO con un oggetto JSON valido, senza NESSUN testo prima o dopo. Niente markdown, niente backtick, niente spiegazioni. Solo JSON puro che inizia con { e finisce con }.`;

  const userPrompt = `Genera un itinerario di viaggio completo per ${days} giorni a ${body.destination}.

DETTAGLI VIAGGIO:
- Partenza: ${body.departureCity} → ${body.destination}
- Date: ${dateArray[0]} → ${dateArray[dateArray.length - 1]}
- Viaggiatori: ${travelers} (${numPeople} persone)
- Budget: ${BUDGET_MAP[body.budget] ?? body.budget}
- Ritmo: ${PACE_MAP[body.pace] ?? body.pace}
- Interessi: ${body.interests?.join(", ") || "cultura, food"}
- Cibo: ${foodInfo || "cucina locale tipica"}

REGOLE FONDAMENTALI:
1. Cita SOLO hotel, ristoranti e attrazioni che esistono REALMENTE a ${body.destination} con ottime recensioni
2. Per nightlife: solo bar, pub, jazz club, discoteche vere - MAI sale giochi o bowling
3. Per spa: solo hotel spa o centri benessere certificati - MAI centri massaggi economici
4. Per ristoranti: posti famosi e verificati, non inventati
5. Includi esperienze autentiche locali: mercati, artigiani, quartieri tipici
6. Includi SEMPRE sezione voli/trasporti con opzioni reali dalla città di partenza

Rispondi con questo JSON (compila con dati reali):

{
  "destination": "${body.destination}",
  "country": "paese",
  "emoji": "emoji bandiera",
  "summary": "frase evocativa e ispirazionale sul viaggio",
  "totalCostMin": 500,
  "totalCostMax": 800,
  "transport": {
    "outbound": {
      "type": "volo o treno",
      "from": "${body.departureCity}",
      "to": "${body.destination}",
      "duration": "es. 2h 30min",
      "estimatedPriceMin": 80,
      "estimatedPriceMax": 200,
      "operators": ["es. Ryanair", "ITA Airways"],
      "tip": "consiglio su quando prenotare o quale compagnia scegliere"
    },
    "return": {
      "type": "volo o treno",
      "from": "${body.destination}",
      "to": "${body.departureCity}",
      "duration": "es. 2h 30min",
      "estimatedPriceMin": 80,
      "estimatedPriceMax": 200
    },
    "local": "come muoversi in città (metro, bus, tram)"
  },
  "days": [
    {
      "day": 1,
      "date": "${dateArray[0]}",
      "theme": "Arrivo e prime scoperte",
      "activities": [
        {
          "time": "10:00",
          "name": "nome posto REALE",
          "description": "descrizione coinvolgente 1-2 frasi",
          "duration": "2h",
          "priceMin": 0,
          "priceMax": 15,
          "category": "cultura",
          "tip": "consiglio pratico insider",
          "bookingRequired": false,
          "type": "activity"
        },
        {
          "time": "13:00",
          "name": "nome ristorante REALE famoso",
          "description": "piatti tipici e atmosfera",
          "duration": "1.5h",
          "priceMin": 15,
          "priceMax": 35,
          "category": "food",
          "tip": "cosa ordinare",
          "bookingRequired": true,
          "type": "restaurant",
          "cuisine": "tipo cucina"
        },
        {
          "time": "15:30",
          "name": "nome posto REALE",
          "description": "descrizione",
          "duration": "2h",
          "priceMin": 0,
          "priceMax": 20,
          "category": "cultura",
          "tip": "consiglio",
          "bookingRequired": false,
          "type": "activity"
        },
        {
          "time": "20:00",
          "name": "nome ristorante/bar REALE",
          "description": "atmosfera serale",
          "duration": "2h",
          "priceMin": 25,
          "priceMax": 50,
          "category": "food",
          "tip": "prenota in anticipo",
          "bookingRequired": true,
          "type": "restaurant",
          "cuisine": "tipo cucina"
        }
      ]
    }
  ],
  "hotels": [
    {
      "name": "nome hotel REALE e famoso",
      "stars": 3,
      "zone": "quartiere specifico",
      "pricePerNight": 90,
      "why": "perché è perfetto per questo profilo viaggiatore",
      "highlights": ["colazione inclusa", "posizione centrale", "wifi"]
    },
    {
      "name": "nome hotel REALE alternativo",
      "stars": 4,
      "zone": "quartiere specifico",
      "pricePerNight": 140,
      "why": "alternativa più lussuosa",
      "highlights": ["spa", "ristorante", "vista panoramica"]
    }
  ],
  "localTips": [
    "consiglio autentico che solo i locals conoscono",
    "altro consiglio pratico",
    "terzo consiglio su usi e costumi locali"
  ],
  "bestFor": "per chi è perfetto questo viaggio"
}

Genera TUTTI i ${days} giorni con 4 attività ciascuno (2 attrazioni + pranzo + cena). Solo JSON.`;

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
            max_tokens: 7000,
            system: systemPrompt,
            messages: [{ role: "user", content: userPrompt }],
          }),
        });

        if (!claudeRes.ok) {
          const err = await claudeRes.text();
          controller.enqueue(encoder.encode(JSON.stringify({
            error: `Errore Claude ${claudeRes.status}: ${err.slice(0, 200)}`
          })));
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

        // Estrai JSON robusto: dalla prima { all'ultima }
        const start = rawText.indexOf("{");
        const end = rawText.lastIndexOf("}");

        if (start === -1 || end === -1 || end <= start) {
          controller.enqueue(encoder.encode(JSON.stringify({ error: "Nessun JSON trovato" })));
          controller.close();
          return;
        }

        let itinerary;
        try {
          itinerary = JSON.parse(rawText.slice(start, end + 1));
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
