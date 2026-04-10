export const runtime = "edge";

interface SuggestionRequest {
  departureCity: string;
  startDate: string;
  endDate: string;
  travelers: string;
  budget: string;
}

const BUDGET_MAP: Record<string, string> = {
  low: "economico", mid: "medio", high: "comfort", luxury: "lusso"
};

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY ?? "";
  if (!apiKey.startsWith("sk-ant-")) {
    return Response.json({ error: "API key mancante" }, { status: 500 });
  }

  let body: SuggestionRequest;
  try { body = await req.json(); }
  catch { return Response.json({ error: "Body non valido" }, { status: 400 }); }

  const days = Math.ceil(
    (new Date(body.endDate).getTime() - new Date(body.startDate).getTime()) / 86400000
  );

  const month = new Date(body.startDate).toLocaleDateString("it-IT", { month: "long" });
  const budget = BUDGET_MAP[body.budget] ?? body.budget;

  const prompt = `Sei un travel planner esperto. Suggerisci 5 destinazioni di viaggio ideali per:
- Partenza da: ${body.departureCity}
- Durata: ${days} giorni in ${month}
- Budget: ${budget}
- Gruppo: ${body.travelers}

Considera: stagione, clima, distanza ragionevole, varietà di esperienze.
Proponi destinazioni diverse tra loro (mix di città d'arte, natura, mare, cultura).

Rispondi SOLO con questo JSON:
{
  "suggestions": [
    {
      "city": "nome città",
      "country": "paese",
      "emoji": "emoji bandiera",
      "tagline": "frase evocativa breve",
      "why": "perché è perfetta in questo periodo per questo profilo (2 frasi)",
      "highlights": ["attrazione1", "attrazione2", "esperienza tipica"],
      "estimatedCostMin": 400,
      "estimatedCostMax": 700,
      "flightTime": "2h 30min"
    }
  ]
}

5 destinazioni diverse, solo JSON valido.`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(" "));
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 2000,
            messages: [{ role: "user", content: prompt }],
          }),
        });

        if (!res.ok) {
          const err = await res.text();
          controller.enqueue(encoder.encode(JSON.stringify({ error: `Errore AI: ${err.slice(0,100)}` })));
          controller.close();
          return;
        }

        const data = await res.json();
        const rawText: string = data.content?.[0]?.text ?? "";

        if (!rawText) {
          controller.enqueue(encoder.encode(JSON.stringify({ error: "Risposta vuota" })));
          controller.close();
          return;
        }

        const start = rawText.indexOf("{");
        const end = rawText.lastIndexOf("}");

        if (start === -1 || end === -1) {
          controller.enqueue(encoder.encode(JSON.stringify({ error: "Nessun JSON trovato" })));
          controller.close();
          return;
        }

        let parsed;
        try {
          parsed = JSON.parse(rawText.slice(start, end + 1));
        } catch {
          controller.enqueue(encoder.encode(JSON.stringify({ error: "JSON non valido" })));
          controller.close();
          return;
        }

        controller.enqueue(encoder.encode(JSON.stringify(parsed)));
        controller.close();
      } catch (err) {
        controller.enqueue(encoder.encode(JSON.stringify({ error: String(err) })));
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { "Content-Type": "application/json" } });
}
