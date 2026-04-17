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
  street: "street food e mercati", casual: "trattorie tipiche",
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

  const days = Math.max(1, Math.min(5, Math.ceil(
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

  const prompt = `Sei un travel planner esperto di ${body.destination}. Genera un itinerario di ${days} giorni.

VIAGGIO: ${body.departureCity} → ${body.destination} | ${body.travelers} | ${BUDGET_MAP[body.budget] ?? body.budget} | ${PACE_MAP[body.pace] ?? body.pace}
INTERESSI: ${body.interests?.slice(0,4).join(", ") || "cultura, food"}
CIBO: ${foodInfo || "cucina locale"}
DATE: ${dateArray.join(", ")}

REGOLE ASSOLUTE — violazioni non accettate:
- Cita SOLO ristoranti, bar e hotel di ${body.destination} che esistono realmente e sono famosi/verificati
- Per NIGHTLIFE: solo bar, pub, jazz club, club veri — MAI sale giochi, bowling, biliardi
- Per SPA/RELAX: solo centri benessere o hotel spa di qualità — MAI centri massaggi cinesi
- Per RISTORANTI: solo locali con almeno 4 stelle Google, ben noti a ${body.destination}
- Includi esperienze AUTENTICHE dei locals: mercati rionali, botteghe artigiane, sagre, piazze di quartiere
- Se non sei CERTO al 100% che un posto esiste, NON includerlo — usa un'alternativa sicura
- Rispondi SOLO con JSON valido

JSON da compilare (dati reali di ${body.destination}):
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
      "theme": "tema",
      "activities": [
        {"time":"09:00","name":"POSTO REALE","description":"descrizione autentica","duration":"2h","priceMin":0,"priceMax":15,"category":"cultura","tip":"consiglio insider","bookingRequired":false,"type":"activity"},
        {"time":"13:00","name":"RISTORANTE REALE famoso","description":"piatti tipici","duration":"1.5h","priceMin":15,"priceMax":35,"category":"food","tip":"cosa ordinare","bookingRequired":true,"type":"restaurant","cuisine":"tipo"},
        {"time":"15:30","name":"POSTO REALE","description":"descrizione","duration":"1.5h","priceMin":0,"priceMax":10,"category":"cultura","tip":"consiglio","bookingRequired":false,"type":"activity"},
        {"time":"20:00","name":"RISTORANTE/BAR REALE","description":"atmosfera serale","duration":"2h","priceMin":20,"priceMax":45,"category":"food","tip":"prenota","bookingRequired":true,"type":"restaurant","cuisine":"tipo"}
      ]
    }
  ],
  "hotels": [
    {"name":"HOTEL REALE","stars":3,"zone":"quartiere","pricePerNight":90,"why":"motivo"},
    {"name":"HOTEL REALE 2","stars":4,"zone":"quartiere","pricePerNight":140,"why":"motivo"}
  ],
  "localTips": ["tip autentico 1","tip autentico 2","tip autentico 3"],
  "bestFor": "per chi è questo viaggio"
}

Genera TUTTI i ${days} giorni con questa struttura. Solo JSON.`;

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
            model: "claude-sonnet-4-6",
            max_tokens: 7000,
            messages: [
              { role: "user", content: prompt },
              // Prefill funziona con sonnet SENZA tools
              { role: "assistant", content: "{" },
            ],
          }),
        });

        if (!claudeRes.ok) {
          const err = await claudeRes.text();
          controller.enqueue(encoder.encode(JSON.stringify({
            error: `Errore Claude ${claudeRes.status}: ${err.slice(0, 100)}`
          })));
          controller.close();
          return;
        }

        const claudeData = await claudeRes.json();
        const rawText = "{" + (claudeData.content?.[0]?.text ?? "");

        if (!rawText || rawText === "{") {
          controller.enqueue(encoder.encode(JSON.stringify({ error: "Risposta AI vuota" })));
          controller.close();
          return;
        }

        const end = rawText.lastIndexOf("}");
        if (end === -1) {
          controller.enqueue(encoder.encode(JSON.stringify({ error: "JSON incompleto" })));
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
