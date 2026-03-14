import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      destination,
      departureCity,
      startDate,
      endDate,
      numTravelers,
      budgetTotal,
      travelStyle,
      experiences,
    } = body;

    if (!destination) {
      return NextResponse.json({ error: "Destinazione mancante" }, { status: 400 });
    }

    // PROMPT PER L’AI
    const prompt = `
Sei ROAMIQ, il Travel Operating System più intelligente.

Crea un itinerario personalizzato di viaggio con queste informazioni:

Partenza da: ${departureCity}
Destinazione: ${destination}
Date: ${startDate} → ${endDate}
Numero viaggiatori: ${numTravelers}
Budget totale: €${budgetTotal}
Stile di viaggio: ${travelStyle?.join(", ")}
Esperienze desiderate: ${experiences?.join(", ")}

Rispondi in JSON nel formato:

{
  "overview": "descrizione generale del viaggio",
  "estimated_cost": 000,
  "flights": [
    { "airline": "", "price": 000, "from": "", "to": "", "link": "" }
  ],
  "hotels": [
    { "name": "", "rating": "", "price_per_night": 000, "link": "" }
  ],
  "restaurants": [
    { "name": "", "type": "", "price_range": "", "link": "" }
  ],
  "activities": [
    { "name": "", "category": "", "price": 00, "link": "" }
  ],
  "daily_plan": [
    { "day": "Giorno 1", "schedule": [ { "time": "", "activity": "" } ] }
  ],
  "premium_option": "ROAMIQ Premium con concierge AI e assistenza h24"
}
Fornisci solo JSON valido, nessuna descrizione ulteriore.
`;

    const response = await fetch("[api.openai.com](https://api.openai.com/v1/chat/completions)", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4-turbo-preview",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content ?? "{}";

    const jsonStart = content.indexOf("{");
    const jsonEnd = content.lastIndexOf("}") + 1;
    const parsed = JSON.parse(content.slice(jsonStart, jsonEnd));

    return NextResponse.json(parsed, { status: 200 });
  } catch (err) {
    console.error("AI ERROR", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
