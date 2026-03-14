"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabaseBrowser } from "../../../lib/supabase-browser"; // ✅ percorso corretto

export default function TripPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(true);

  // ---- 1. CARICA IL VIAGGIO DAL DB ----
  useEffect(() => {
    const loadTrip = async () => {
      const { data, error } = await supabaseBrowser
        .from("trip_requests")
        .select("*")
        .eq("id", id)
        .single();
      if (!error) setTrip(data);
    };
    loadTrip();
  }, [id]);

  // ---- 2. INVIA I DATI ALL’AI APPENA DISPONIBILI ----
  useEffect(() => {
    const generate = async () => {
      if (!trip) return;
      const res = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trip),
      });
      const result = await res.json();
      setData(result);
      setGenerating(false);
      setLoading(false);
    };
    generate();
  }, [trip]);

  // ---- 3. SCHERMATA DI CARICAMENTO ----
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black via-[#0b0d13] to-[#111317] text-white">
        <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mb-6" />
        <h1 className="text-2xl font-semibold">Generazione itinerario</h1>
        <p className="text-gray-400 mt-2">ROAMIQ sta creando il tuo viaggio intelligente...</p>
      </div>
    );
  }

  // ---- 4. UI DELL’ITINERARIO COMPLETO ----
  return (
    <div className="min-h-screen bg-[#0a0c11] text-white px-6 py-16">
      <h1 className="text-5xl font-bold text-center mb-8">{trip.destination}</h1>
      <section className="mb-12 text-center">
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">{data.overview}</p>
      </section>

      {/* Sezione Voli */}
      {data.flights && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 border-b border-white/10 pb-2">
            ✈️ Voli suggeriti
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.flights.map((f: any, i: number) => (
              <a
                key={i}
                href={f.link}
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
              >
                <p className="font-semibold">{f.airline}</p>
                <p>{f.from} → {f.to}</p>
                <p className="text-orange-400 font-bold mt-2">€{f.price}</p>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Sezione Hotel */}
      {data.hotels && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 border-b border-white/10 pb-2">
            🏨 Hotel consigliati
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.hotels.map((h: any, i: number) => (
              <a
                key={i}
                href={h.link}
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
              >
                <p className="font-semibold">{h.name}</p>
                <p>{h.rating}★</p>
                <p className="text-orange-400 font-bold mt-2">
                  €{h.price_per_night}/notte
                </p>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Ristoranti / Attività */}
      {(data.restaurants || data.activities) && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 border-b border-white/10 pb-2">
            🍽️ Esperienze e attività
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...(data.restaurants ?? []), ...(data.activities ?? [])].map(
              (x: any, i: number) => (
                <a
                  key={i}
                  href={x.link}
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
                >
                  <p className="font-semibold">{x.name}</p>
                  <p className="text-gray-400 text-sm">
                    {x.type || x.category}
                  </p>
                  <p className="text-orange-400 font-bold mt-2">
                    {x.price ? `€${x.price}` : x.price_range || ""}
                  </p>
                </a>
              )
            )}
          </div>
        </section>
      )}

      {/* Itinerario giornaliero */}
      {data.daily_plan && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-4 border-b border-white/10 pb-2">
            🗓️ Itinerario giorno per giorno
          </h2>
          <div className="space-y-6">
            {data.daily_plan.map((d: any, i: number) => (
              <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/5">
                <h3 className="font-semibold text-xl mb-2">{d.day}</h3>
                <ul className="text-gray-300 list-disc pl-5 space-y-1">
                  {d.schedule?.map((s: any, j: number) => (
                    <li key={j}>
                      {s.time ? `${s.time} – ` : ""}{s.activity}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Prezzo + Premium */}
      <section className="text-center mt-12">
        <p className="text-gray-300 text-lg">
          Costo stimato totale:{" "}
          <span className="text-orange-400 font-bold">
            €{data.estimated_cost}
          </span>
        </p>
        <div className="mt-6 inline-block px-8 py-5 rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 text-black font-semibold text-lg shadow-lg">
          {data.premium_option}
        </div>
      </section>
    </div>
  );
}
