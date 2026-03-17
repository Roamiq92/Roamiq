"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabaseBrowser } from "../../lib/supabase-browser";

export default function TripPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mapUrl, setMapUrl] = useState<string | null>(null);

  // 1. Carica i dati del viaggio
  useEffect(() => {
    const loadTrip = async () => {
      const { data } = await supabaseBrowser.from("trip_requests").select("*").eq("id", id).single();
      if (data) setTrip(data);
    };
    loadTrip();
  }, [id]);

  // 2. Genera itinerario + mappa statica
  useEffect(() => {
    const generate = async () => {
      if (!trip) return;
      const res = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trip)
      });
      const result = await res.json();
      setData(result);
      setLoading(false);

      // immagine statica da OpenStreetMap (fallback)
      const encoded = encodeURIComponent(trip.destination);
      setMapUrl(`[source.unsplash.com](https://source.unsplash.com/1000x400/?${encoded},city)`);
    };
    generate();
  }, [trip]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black via-[#0b0d13] to-[#111317] text-white">
        <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mb-6" />
        <h1 className="text-2xl font-semibold">Generazione itinerario...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white flex flex-col items-center">
      <section className="text-center py-12 px-4 max-w-4xl">
        <h1 className="text-5xl font-bold mb-4">{trip.destination}</h1>
        <p className="text-gray-400 text-lg">{data.overview}</p>
      </section>

      {mapUrl && (
        <div className="w-full max-w-4xl mb-10 rounded-2xl overflow-hidden shadow-2xl">
          <img src={mapUrl} alt="Mappa della città" className="object-cover w-full h-80 opacity-90" />
        </div>
      )}

      <div className="w-full max-w-5xl px-6">
        <DashboardSection title="✈️ Voli" list={data.flights} type="flight" />
        <DashboardSection title="🏨 Hotel" list={data.hotels} type="hotel" />
        <DashboardSection title="🍽️ Ristoranti / Attività" list={[...(data.restaurants ?? []), ...(data.activities ?? [])]} />
      </div>

      <footer className="py-10 text-center">
        <p className="text-gray-400 mb-2">
          Costo stimato totale 
          <span className="text-orange-400 font-semibold">€{data.estimated_cost}</span>
        </p>
        <button className="px-10 py-4 rounded-full text-black bg-orange-500 hover:bg-orange-400 font-semibold">
          Attiva ROAMIQ Premium
        </button>
      </footer>
    </div>
  );
}

function DashboardSection({ title, list, type }: { title: string; list?: any[]; type?: string }) {
  if (!list || list.length === 0) return null;
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold mb-4 border-b border-white/10 pb-2">{title}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((item, i) => (
          <a
            key={i}
            href={item.link}
            target="_blank"
            rel="noreferrer"
            className="p-4 border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl transition block group"
          >
            <p className="font-semibold group-hover:text-orange-400 transition">
              {item.name || item.airline}
            </p>
            {item.price && <p className="text-gray-400 text-sm">€{item.price}</p>}
          </a>
        ))}
      </div>
    </section>
  );
}
