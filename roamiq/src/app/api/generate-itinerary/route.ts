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
  low: "economico sotto €80/giorno", mid: "medio €80-200/giorno",
  high: "comfort €200-400/giorno",   luxury: "lusso oltre €400/giorno",
};
const PACE_MAP: Record<string, string> = {
  lento: "rilassato 3 attività/giorno",
  equilibrato: "equilibrato 4-5 attività/giorno",
  intenso: "intenso 6+ attività/giorno",
};

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY ?? "";
  if (!apiKey.startsWith("sk-ant-")) {
    return Response.json({ error: "API key Anthropic mancante o errata" }, { status: 500 });
  }

  let body: OnboardingData;
  try { body = await req.json(); }
  catch { return Response.json({ error: "Body non valido" }, { status: 400 }); }

  const days = Math.ceil(
    (new Date(body.endDate).getTime() - new Date(body.startDate).getTime()) / 86400000
  );

  const prompt = `Sei ROAMIQ travel planner. Genera itinerario JSON per ${days} giorni a ${body.destination}.
Partenza: ${body.departureCity} | Gruppo: ${body.travelers} | Budget: ${BUDGET_MAP[body.budget] ?? body.budget} | Ritmo: ${PACE_MAP[body.pace] ?? body.pace} | Interessi: ${body.interests.slice(0,4).join(", ")}

Rispondi SOLO con JSON valido senza markdown:
{"destination":"${body.destination}","country":"paese","emoji":"🏳️","summary":"frase evocativa 1 riga","totalCostMin":400,"totalCostMax":700,"days":[{"day":1,"date":"${body.startDate}","theme":"tema del giorno","activities":[{"time":"09:00","name":"nome reale","description":"descrizione coinvolgente","duration":"2h","priceMin":0,"priceMax":15,"category":"cultura","tip":"consiglio insider","bookingRequired":false}]}],"hotels":[{"name":"hotel reale","stars":3,"zone":"quartiere","pricePerNight":90,"why":"perché consigliato"}],"localTips":["tip1","tip2","tip3"],"bestFor":"per chi è questo viaggio"}

Genera TUTTI ${days} giorni con 4 attività reali ciascuno. Solo JSON.`;

  // ── STREAMING: inviamo il primo byte subito, poi aspettiamo Claude ──
  // Questo soddisfa il limite "25s initial response" di Vercel gratis
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Primo byte immediato → Vercel non va in timeout
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
            max_tokens: 3000,
            messages: [{ role: "user", content: prompt }],
          }),
        });

        if (!claudeRes.ok) {
          const err = await claudeRes.text();
          controller.enqueue(encoder.encode(JSON.stringify({ error: `Claude errore ${claudeRes.status}: ${err}` })));
          controller.close();
          return;
        }

        const data = await claudeRes.json();
        const rawText: string = data.content?.[0]?.text ?? "";

        if (!rawText) {
          controller.enqueue(encoder.encode(JSON.stringify({ error: "Risposta AI vuota" })));
          controller.close();
          return;
        }

        // Parse JSON — estrai direttamente il blocco { } ignorando qualsiasi markdown
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          controller.enqueue(encoder.encode(JSON.stringify({ error: "Nessun JSON trovato nella risposta AI" })));
          controller.close();
          return;
        }
        let itinerary;
        try {
          itinerary = JSON.parse(jsonMatch[0]);
        } catch {
          controller.enqueue(encoder.encode(JSON.stringify({ error: "JSON non valido: " + jsonMatch[0].slice(0, 80) })));
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

  return new Response(stream, {
    headers: { "Content-Type": "application/json" },
  });
}
