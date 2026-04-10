export const runtime = "edge";

interface SuggestionRequest {
  departureCity: string;
  startDate: string;
  endDate: string;
  travelers: string;
  budget: string;
}

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

  const budgetLabel: Record<string, string> = {
    low: "economico", mid: "medio", high: "comfort", luxury: "lusso"
  };

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
            messages: [
              {
                role: "user",
                content: `Suggerisci 5 destinazioni di viaggio per una persona/gruppo che parte da ${body.departureCity}, ${days} giorni, budget ${budgetLabel[body.budget] ?? body.budget}, ${body.travelers}.

Considera stagione (partenza ${body.startDate}), distanza ragionevole, e varietà di esperienze.

Rispondi SOLO con JSON:`,
              },
              {
                role: "assistant",
                content: `{
  "suggestions": [
    {
      "city": "nome città",
      "country": "paese",
      "emoji": "🏳️",
      "tagline": "frase breve evocativa",
      "why": "perché è perfetta per questo profilo in questa stagione",
      "highlights": ["highlight1", "highlight2", "highlight3"],
      "estimatedCostMin": 400,
      "estimatedCostMax": 700,
      "flightTime": "2h"
    }
  ]
}`,
              },
            ],
          }),
        });

        if (!res.ok) {
          controller.enqueue(encoder.encode(JSON.stringify({ error: "Errore AI" })));
          controller.close();
          return;
        }

        const data = await res.json();
        const rawText = "{" + (data.content?.[0]?.text ?? "");
        const end = rawText.lastIndexOf("}");
        if (end === -1) {
          controller.enqueue(encoder.encode(JSON.stringify({ error: "Risposta incompleta" })));
          controller.close();
          return;
        }

        let parsed;
        try { parsed = JSON.parse(rawText.slice(0, end + 1)); }
        catch {
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
