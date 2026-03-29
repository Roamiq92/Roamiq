import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

// Estende il timeout Vercel a 60 secondi (necessario per Claude AI)
export const maxDuration = 60;

/* ── Types ─────────────────────────────────────────────────── */
interface OnboardingData {
  destination: string;
  departureCity: string;
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

/* ── Prompt ─────────────────────────────────────────────────── */
function buildPrompt(data: OnboardingData): string {
  const days = Math.ceil(
    (new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / 86400000
  );

  const activitiesPerDay = data.pace === "lento" ? 3 : data.pace === "equilibrato" ? 5 : 7;

  return `Sei ROAMIQ, un AI travel planner esperto. Genera un itinerario di viaggio in formato JSON.

DATI VIAGGIO:
- Partenza da: ${data.departureCity}
- Destinazione: ${data.destination}
- Durata: ${days} giorni (${data.startDate} → ${data.endDate})
- Viaggiatori: ${data.travelers}
- Budget: ${BUDGET_MAP[data.budget]}
- Ritmo: ${PACE_MAP[data.pace]}
- Interessi: ${data.interests.join(", ")}

IMPORTANTE: Rispondi SOLO con JSON valido, zero testo prima o dopo, zero markdown.

{
  "destination": "${data.destination}",
  "country": "nome paese in italiano",
  "emoji": "emoji bandiera",
  "summary": "frase evocativa di 1 riga su questo viaggio",
  "totalCostMin": 400,
  "totalCostMax": 600,
  "days": [
    {
      "day": 1,
      "date": "${data.startDate}",
      "theme": "Arrivo e primo impatto",
      "activities": [
        {
          "time": "10:00",
          "name": "Nome attività",
          "description": "Descrizione breve e coinvolgente.",
          "duration": "2h",
          "priceMin": 0,
          "priceMax": 20,
          "category": "cultura",
          "tip": "Consiglio pratico.",
          "bookingRequired": false
        }
      ]
    }
  ],
  "hotels": [
    {
      "name": "Nome hotel",
      "stars": 3,
      "zone": "Quartiere",
      "pricePerNight": 90,
      "why": "Perché questo hotel per te."
    }
  ],
  "localTips": [
    "Consiglio locale 1",
    "Consiglio locale 2",
    "Consiglio locale 3"
  ],
  "bestFor": "Descrizione di chi è perfetto questo viaggio"
}

Genera esattamente ${days} giorni, ognuno con ${activitiesPerDay} attività. Prezzi realistici in euro. Tutto in italiano.`;
}

/* ── Handler ────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const body: OnboardingData = await req.json();

    if (!body.destination || !body.startDate || !body.endDate) {
      return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
    }

    // Chiama Claude
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        messages: [{ role: "user", content: buildPrompt(body) }],
      }),
    });

    if (!claudeRes.ok) {
      const err = await claudeRes.text();
      console.error("Claude API error:", err);
      return NextResponse.json({ error: "Errore AI: " + err }, { status: 500 });
    }

    const claudeData = await claudeRes.json();
    const rawText = claudeData.content?.[0]?.text ?? "";

    if (!rawText) {
      return NextResponse.json({ error: "Risposta AI vuota" }, { status: 500 });
    }

    // Parsing JSON robusto
    let itinerary;
    try {
      const clean = rawText
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();
      itinerary = JSON.parse(clean);
    } catch {
      // Prova a estrarre il JSON con regex
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          itinerary = JSON.parse(match[0]);
        } catch {
          console.error("JSON parse failed:", rawText.slice(0, 300));
          return NextResponse.json({ error: "Errore parsing itinerario" }, { status: 500 });
        }
      } else {
        return NextResponse.json({ error: "Formato risposta non valido" }, { status: 500 });
      }
    }

    // Salva su Supabase (con fallback se fallisce)
    try {
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

      if (!dbError && trip) {
        return NextResponse.json({ tripId: trip.id, itinerary });
      }
    } catch (dbErr) {
      console.error("Supabase error (non-fatal):", dbErr);
    }

    // Fallback: ritorna itinerario senza salvare
    return NextResponse.json({ tripId: "demo", itinerary });

  } catch (error) {
    console.error("Generate itinerary error:", error);
    return NextResponse.json({ error: "Errore interno del server" }, { status: 500 });
  }
}
