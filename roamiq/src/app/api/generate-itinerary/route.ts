import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

/* ── Types ─────────────────────────────────────────────────── */
interface OnboardingData {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: "solo" | "coppia" | "amici" | "famiglia";
  budget: "low" | "mid" | "high" | "luxury";
  interests: string[];
  pace: "lento" | "equilibrato" | "intenso";
}

const BUDGET_MAP = {
  low:    "economico (meno di €80/giorno a persona)",
  mid:    "medio (€80–200/giorno a persona)",
  high:   "comfort (€200–400/giorno a persona)",
  luxury: "lusso (oltre €400/giorno a persona)",
};

const PACE_MAP = {
  lento:       "rilassato (2–3 attività al giorno, molto tempo libero)",
  equilibrato: "equilibrato (3–5 attività al giorno)",
  intenso:     "intenso (5+ attività al giorno, ogni momento sfruttato)",
};

/* ── Prompt builder ─────────────────────────────────────────── */
function buildPrompt(data: OnboardingData): string {
  const days = Math.ceil(
    (new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / 86400000
  );

  return `Sei ROAMIQ, un AI travel planner esperto. Genera un itinerario di viaggio dettagliato in formato JSON.

DATI VIAGGIO:
- Destinazione: ${data.destination}
- Durata: ${days} giorni (${data.startDate} → ${data.endDate})
- Viaggiatori: ${data.travelers}
- Budget: ${BUDGET_MAP[data.budget]}
- Ritmo: ${PACE_MAP[data.pace]}
- Interessi: ${data.interests.join(", ")}

Rispondi SOLO con un oggetto JSON valido, nessun testo prima o dopo. Struttura esatta:

{
  "destination": "${data.destination}",
  "country": "nome paese",
  "emoji": "emoji bandiera paese",
  "summary": "frase evocativa di 1 riga che descrive questo viaggio specifico",
  "totalCostMin": numero (costo minimo totale p.p. in euro),
  "totalCostMax": numero (costo massimo totale p.p. in euro),
  "days": [
    {
      "day": 1,
      "date": "${data.startDate}",
      "theme": "titolo breve del giorno es. Arrivo & Gaudí",
      "activities": [
        {
          "time": "09:00",
          "name": "nome attività",
          "description": "descrizione coinvolgente di 1-2 frasi con contesto storico/culturale",
          "duration": "2h",
          "priceMin": 0,
          "priceMax": 30,
          "category": "cultura|food|natura|nightlife|shopping|sport|relax|trasporto|alloggio",
          "tip": "consiglio pratico insider di 1 frase",
          "bookingRequired": true
        }
      ]
    }
  ],
  "hotels": [
    {
      "name": "nome hotel",
      "stars": 3,
      "zone": "quartiere",
      "pricePerNight": 80,
      "why": "perché questo hotel per questo profilo viaggiatore"
    }
  ],
  "localTips": [
    "consiglio locale autentico 1",
    "consiglio locale autentico 2",
    "consiglio locale autentico 3"
  ],
  "bestFor": "chi viaggia ${data.travelers} con interessi in ${data.interests.slice(0,2).join(" e ")}"
}

Genera ${days} giorni completi. Ogni giorno deve avere almeno ${data.pace === "lento" ? 3 : data.pace === "equilibrato" ? 5 : 7} attività inclusi pasti e trasporti. Prezzi realistici in euro. Usa la lingua italiana.`;
}

/* ── Route handler ──────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const body: OnboardingData = await req.json();

    // Validate input
    if (!body.destination || !body.startDate || !body.endDate) {
      return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
    }

    // Call Claude API
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 8192,
        messages: [{ role: "user", content: buildPrompt(body) }],
      }),
    });

    if (!claudeRes.ok) {
      const err = await claudeRes.text();
      console.error("Claude API error:", err);
      return NextResponse.json({ error: "Errore AI" }, { status: 500 });
    }

    const claudeData = await claudeRes.json();
    const rawText = claudeData.content[0]?.text ?? "";

    // Parse JSON from Claude response
    let itinerary;
    try {
      // Strip possible markdown fences
      const clean = rawText.replace(/```json|```/g, "").trim();
      itinerary = JSON.parse(clean);
    } catch {
      console.error("JSON parse failed:", rawText.slice(0, 200));
      return NextResponse.json({ error: "Errore parsing itinerario" }, { status: 500 });
    }

    // Save to Supabase
    const supabase = createClient();
    const { data: trip, error: dbError } = await supabase
      .from("trips")
      .insert({
        destination: body.destination,
        start_date: body.startDate,
        end_date: body.endDate,
        travelers: body.travelers,
        budget: body.budget,
        interests: body.interests,
        pace: body.pace,
        itinerary,
        status: "generated",
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("Supabase error:", dbError);
      // Return itinerary anyway without saving (graceful fallback)
      return NextResponse.json({ tripId: "demo", itinerary });
    }

    return NextResponse.json({ tripId: trip.id, itinerary });
  } catch (error) {
    console.error("Generate itinerary error:", error);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}
