"use client";

import "leaflet/dist/leaflet.css";                       // <– CSS necessario
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabaseBrowser } from "../../lib/supabase-browser";  // percorso corretto
import dynamic from "next/dynamic";

// Lazy import di Leaflet (per evitare errori SSR)
const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(m => m.Popup), { ssr: false });

export default function TripPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState<[number, number] | null>(null);

  // 1. Caricamento dati viaggio
  useEffect(() => {
    const loadTrip = async () => {
      const { data } = await supabaseBrowser.from("trip_requests").select("*").eq("id", id).single();
      if (data) setTrip(data);
    };
    loadTrip();
  }, [id]);

  // 2. Generazione tramite AI + geocoding città
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

      // otteniamo coordinate dal nome città
      const g = await fetch(`[nominatim.openstreetmap.org](https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trip.destination)})`);
      const geo = await g.json();
      if (geo[0]) setCoords([parseFloat(geo[0].lat), parseFloat(geo[0].lon)]);
    };
    generate();
  }, [trip]);

  if (loading || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black via-[#0b0d13] to-[#111317] text-white">
        <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mb-6" />
        <h1 className="text-2xl font-semibold">Generazione itinerario...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white flex flex-col items-center">
      {/* Hero */}
      <section className="text-center py-12 px-4 max-w-4xl">
        <h1 className="text-5xl font-bold mb-4">{trip.destination}</h1>
        {data.overview && <p className="text-gray-400 text-lg">{data.overview}</p>}
      </section>

      {/* Mappa */}
      {coords && (
        <div className="w-full max-w-4xl h-72 rounded-2xl overflow-hidden mb-10">
          <MapContainer center={coords} zoom={12} style={{ width: "100%", height: "100%" }}>
            <TileLayer url="[{s}.tile.openstreetmap.org](https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png)"
              attribution="© OpenStreetMap" />
            <Marker position={coords}>
              <Popup>{trip.destination}</Popup>
            </Marker>
          </MapContainer>
        </div>
      )}

      <div className="w-full max-w-5xl px-6">
        {data.flights && (
          <DashboardSection title="✈️ Voli">
            {data.flights.map((f: any, i: number) => (
              <BookingCard key={i} title={`${f.airline} ${f.from} → ${f.to}`} subtitle={`€${f.price}`} link={f.link} />
            ))}
          </DashboardSection>
        )}
        {data.hotels && (
          <DashboardSection title="🏨 Hotel">
            {data.hotels.map((h: any, i: number) => (
              <BookingCard key={i} title={h.name} subtitle={`${h.rating}★ €${h.price_per_night}/notte`} link={h.link} />
            ))}
          </DashboardSection>
        )}
        {data.activities && (
          <DashboardSection title="🎟️ Attività">
            {data.activities.map((a: any, i: number) => (
              <BookingCard key={i} title={a.name} subtitle={a.category || ""} link={a.link} />
            ))}
          </DashboardSection>
        )}
        {data.restaurants && (
          <DashboardSection title="🍽️ Ristoranti">
            {data.restaurants.map((r: any, i: number) => (
              <BookingCard key={i} title={r.name} subtitle={r.type} link={r.link} />
            ))}
          </DashboardSection>
        )}
      </div>

      {/* Totale & Bottone Premium */}
      <footer className="py-10 text-center">
        <p className="text-gray-400 mb-2">
          Costo stimato totale 
          <span className="text-orange-400 font-semibold">€{data.estimated_cost}</span>
        </p>
        <button className="px-10 py-4 rounded-full text-black bg-orange-500 hover:bg-orange-400 font-semibold">
          Attiva ROAMIQ Premium
        </button>
      </footer>
    </div>
  );
}

function DashboardSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold mb-4 border-b border-white/10 pb-2">{title}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
    </section>
  );
}

function BookingCard({
  title,
  subtitle,
  link
}: {
  title: string;
  subtitle?: string;
  link: string;
}) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      className="p-4 border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl transition block group"
    >
      <p className="font-semibold group-hover:text-orange-400 transition">{title}</p>
      {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
      <div className="mt-2 text-sm text-orange-500 font-medium">Prenota →</div>
    </a>
  );
}
