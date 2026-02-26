import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      destination,
      startDate,
      endDate,
      numTravelers,
      budgetTotal,
      travelStyle,
      interests,
      pace,
      specialRequests
    } = body;

    if (!destination) {
      return NextResponse.json({ error: "Destination missing" }, { status: 400 });
    }

    const prompt = `
    Sei ROAMIQ, il Travel Operating System più intelligente al mondo.

    Crea un itinerario completo e personalizzato basato su:

    Destinazione: ${destination}
    Date: ${startDate} → ${endDate}
    Viaggiatori: ${numTravelers}
    Budget totale: €${budgetTotal}
    Stile: ${travelStyle?.join(", ")}
    Interessi: ${interests?.join(", ")}
    Ritmo: ${pace}
    Richieste extra: ${specialRequests}

    Rispondi SOLO con un JSON valido avente questa struttura:

    {
      "summary": "",
      "estimated_cost": 0,
      "flights": [
        { "airline": "", "price": 0, "from": "", "to": "", "departure": "", "return": "", "link": "" }
      ],
      "hotels": [
        { "name": "", "rating": "", "price_per_night": 0, "location": "", "link": "" }
      ],
      "restaurants": [
        { "name": "", "type": "", "price_range": "", "link": "" }
      ],
      "daily_plan": [
        { "day": "", "activities": [ { "time": "", "activity": "", "address": "", "link": "" } ] }
      ],
      "ai_notes": ""
    }
    `;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    const content = data.choices?.[0]?.message?.content || "{}";
    const jsonStart = content.indexOf("{");
    const jsonEnd = content.lastIndexOf("}") + 1;
    const parsed = JSON.parse(content.slice(jsonStart, jsonEnd));

    return NextResponse.json(parsed, { status: 200 });

  } catch (e) {
    console.error("AI ERROR:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
