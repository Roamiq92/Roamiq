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
  street: "street food", casual: "trattorie casual",
  restaurant: "ristoranti curati", fine: "fine dining",
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
    body.dietaryNeeds?.length ? `dieta: ${body.dietaryNeeds.join(", ")}` : "",
    body.diningBudget ? `stile: ${DINING_MAP[body.diningBudget] ?? body.diningBudget}` : "",
  ].filter(Boolean).join(" | ");

  const prompt = `Genera un itinerario di viaggio JSON per ${days} giorni a ${body.destination}.
Dati: da ${body.departureCity}, ${body.travelers}, ${BUDGET_MAP[body.budget] ?? body.budget}, ${PACE_MAP[body.pace] ?? body.pace}, interessi: ${body.interests?.slice(0,3).join(", ")}.
${foodInfo ? `Cibo: ${foodInfo}.` : ""}
Date: ${dateArray.join(", ")}.

Struttura JSON richiesta (compila con dati reali di ${body.destination}):
{
  "destination": "${body.destination}",
  "country": "paese",
  "emoji": "bandiera emoji",
  "summary": "frase evocativa",
  "totalCostMin": 400,
  "totalCostMax": 700,
  "days": [
    {
      "day": 1,
      "date": "${dateArray[0]}",
      "theme": "tema",
      "activities": [
        {"time":"09:00","name":"posto reale","description":"descrizione","duration":"2h","priceMin":0,"priceMax":15,"category":"cultura","tip":"consiglio","bookingRequired":false,"type":"activity"},
        {"time":"13:00","name":"ristorante reale","description":"piatti tipici","duration":"1.5h","priceMin":15,"priceMax":35,"category":"food","tip":"cosa ordinare","bookingRequired":true,"type":"restaurant","cuisine":"tipo cucina"},
        {"time":"15:00","name":"posto reale","description":"descrizione","duration":"2h","priceMin":10,"priceMax":25,"category":"cultura","tip":"consiglio","bookingRequired":true,"type":"activity"},
        {"time":"20:00","name":"ristorante reale","description":"atmosfera serale","duration":"2h","priceMin":25,"priceMax":50,"category":"food","tip":"prenota in anticipo","bookingRequired":true,"type":"restaurant","cuisine":"tipo cucina"}
      ]
    }
  ],
  "hotels": [
    {"name":"hotel reale","stars":3,"zone":"quartiere","pricePerNight":90,"why":"motivo"},
    {"name":"hotel reale 2","stars":4,"zone":"quartiere","pricePerNight":140,"why":"motivo"}
  ],
  "localTips": ["tip1","tip2","tip3"],
  "bestFor": "per chi è questo viaggio"
}
Genera tutti i ${days} giorni con questa struttura. Solo dati reali di ${body.destination}.`;

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
            model: "claude-haiku-4-5-20251001",
            max_tokens: 6000,
            messages: [
              { role: "user", content: prompt },
              // PREFILL: forza Claude a iniziare con { — garantisce JSON puro senza markdown
              { role: "assistant", content: "{" },
            ],
          }),
        });

        if (!claudeRes.ok) {
          const err = await claudeRes.text();
          controller.enqueue(encoder.encode(JSON.stringify({ error: `Errore Claude ${claudeRes.status}: ${err.slice(0,100)}` })));
          controller.close();
          return;
        }

        const claudeData = await claudeRes.json();
        // Con il prefill, Claude continua dal "{" — lo aggiungiamo noi
        const rawText: string = "{" + (claudeData.content?.[0]?.text ?? "");

        if (!rawText || rawText === "{") {
          controller.enqueue(encoder.encode(JSON.stringify({ error: "Risposta AI vuota" })));
          controller.close();
          return;
        }

        // Estrai JSON: dalla prima { all'ultima }
        const end = rawText.lastIndexOf("}");
        if (end === -1) {
          controller.enqueue(encoder.encode(JSON.stringify({ error: "JSON incompleto nella risposta" })));
          controller.close();
          return;
        }

        let itinerary;
        try {
          itinerary = JSON.parse(rawText.slice(0, end + 1));
        } catch {
          controller.enqueue(encoder.encode(JSON.stringify({ error: "JSON non parsabile" })));
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
        controller.enqueue(encoder.encode(JSON.stringify({ error: `Errore: ${String(err)}` })));
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { "Content-Type": "application/json" } });
}
