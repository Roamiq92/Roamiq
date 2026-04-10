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
    body.dietaryNeeds?.filter(d => d !== "nessuna").length ? `dieta: ${body.dietaryNeeds?.filter(d => d !== "nessuna").join(", ")}` : "",
    body.diningBudget ? `stile: ${DINING_MAP[body.diningBudget] ?? body.diningBudget}` : "",
  ].filter(Boolean).join(" | ");

  const prompt = `Sei un travel planner esperto con profonda conoscenza di ${body.destination}. Genera un itinerario di viaggio per ${days} giorni.

DATI VIAGGIO:
- Partenza: ${body.departureCity} → ${body.destination}
- Date: ${dateArray.join(", ")}
- Gruppo: ${body.travelers}
- Budget: ${BUDGET_MAP[body.budget] ?? body.budget}
- Ritmo: ${PACE_MAP[body.pace] ?? body.pace}
- Interessi: ${body.interests?.slice(0,4).join(", ") || "cultura, food"}
- Preferenze cibo: ${foodInfo || "cucina locale tipica"}

REGOLE CRITICHE PER LA QUALITÀ:
1. RISTORANTI: Cita SOLO ristoranti realmente famosi e verificati di ${body.destination}, con ottime recensioni su Google/TripAdvisor. MAI inventare nomi. Se non sei certo al 100% che un ristorante esiste e ha buone recensioni, NON citarlo.
2. ATTRAZIONI: Solo luoghi reali e iconici di ${body.destination}. Niente posti inventati.
3. NIGHTLIFE: Solo locali notturni reali (bar, club, lounge). MAI confondere sale giochi, centri massaggi o altri posti con locali notturni.
4. SPA/BENESSERE: Solo centri benessere veri di qualità. MAI centri massaggi economici o non verificati.
5. ESPERIENZE LOCALI: Includi esperienze autentiche dei locals (mercati, feste locali, quartieri autentici, artigiani, cucina di strada reale). Evita le solite attrazioni turistiche banali.
6. VERIFICA: Prima di includere qualsiasi posto, chiediti: "Sono al 100% sicuro che questo posto esiste, è aperto e ha buone recensioni?" Se la risposta è no, NON includerlo.

Rispondi SOLO con JSON valido:`;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(" "));

      try {
        // Usa claude-sonnet per maggiore accuratezza fattuale
        // con web_search abilitato per verificare i posti reali
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
            tools: [
              {
                type: "web_search_20250305",
                name: "web_search",
                max_uses: 5,
              }
            ],
            messages: [
              { role: "user", content: prompt },
              {
                role: "assistant",
                content: `Utilizzerò la ricerca web per verificare i ristoranti e i locali più famosi di ${body.destination} prima di includerli nell'itinerario. Questo garantirà che tutti i posti siano reali e abbiano ottime recensioni.

{`,
              },
            ],
          }),
        });

        if (!claudeRes.ok) {
          const err = await claudeRes.text();
          controller.enqueue(encoder.encode(JSON.stringify({ error: `Errore Claude: ${err.slice(0,100)}` })));
          controller.close();
          return;
        }

        const claudeData = await claudeRes.json();

        // Estrai il testo dalla risposta (può contenere tool_use blocks)
        const textBlocks = claudeData.content?.filter((b: {type: string}) => b.type === "text") ?? [];
        const rawText = "{" + (textBlocks.map((b: {text: string}) => b.text).join("") ?? "");

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
