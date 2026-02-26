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

    // Safety check
    if (!destination) {
      return NextResponse.json({ error: "Destination missing" }, { status: 400 });
    }

    // AI GENERATION USING OPENAI
    const prompt = `
    Sei ROAMIQ, il Travel Operating System più intelligente al mondo.

    Crea un itinerario di viaggio completo e altamente personalizzato sulla base di questi dati:

    Destinazione: ${destination}
    Date: ${startDate} → ${endDate}
    Numero viaggiatori: ${numTravelers}
    Budget totale: €${budgetTotal}
    Stile di viaggio: ${travelStyle.join(", ")}
    Interessi: ${interests.join(", ")}
    Ritmo: ${pace}
    Richieste speciali: ${specialRequests}

    Devi restituire un JSON valido con questa struttura precisa:

    {
      "summary": "breve descrizione del viaggio",
      "estimated_cost": 000,
      "flights": [
        {
          "airline": "",
          "price": 000,
          "from": "",
          "to": "",
          "departure": "",
          "return": "",
          "link": "link alla prenotazione"
        }
      ],
      "hotels": [
        {
          "name": "",
          "rating": "",
          "price_per_night": 000,
          "location": "",
          "link": ""
        }
      ],
      "restaurants": [
        {
          "name": "",
          "type": "",
          "price_range": "",
          "link": ""
        }
      ],
      "daily_plan": [
        {
          "day": "Giorno 1",
          "activities": [
            { "time": "", "activity": "", "address": "", "link": "" }
          ]
        }
      ],
      "ai_notes": "spiegazione dell'itinerario"
    }

    Fornisci solo JSON valido. Nessun testo fuori dal JSON.
    `;

    // AI CALL
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

    // Estrarre solo JSON dal modello
    const content = data.choices?.[0]?.message?.content;
    const jsonStart = content.indexOf("{");
    const jsonEnd = content.lastIndexOf("}") + 1;
    const parsed = JSON.parse(content.slice(jsonStart, jsonEnd));

    return NextResponse.json(parsed, { status: 200 });

  } catch (e) {
    console.log("AI ERROR:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
