"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabaseBrowser } from "../../../lib/supabase-browser";

export default function TripPage() {
  const params = useParams();
  const tripId = params?.id as string;

  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [itinerary, setItinerary] = useState<any>(null);

  useEffect(() => {
    loadTrip();
  }, []);

  const loadTrip = async () => {
    const { data, error } = await supabaseBrowser
      .from("trip_requests")
      .select("*")
      .eq("id", tripId)
      .single();

    if (!error) setTrip(data);
    setLoading(false);
  };

  const generateItinerary = async () => {
    setGenerating(true);

    const res = await fetch("/api/generate-itinerary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(trip)
    });

    const result = await res.json();
    setItinerary(result);

    setGenerating(false);
  };

  if (loading) return <p className="text-center mt-20">Caricamento...</p>;

  return (
    <div className="min-h-screen text-white px-6 py-20">
      <h1 className="text-4xl font-bold mb-4">
        Viaggio a {trip.destination}
      </h1>

      <p className="text-gray-400 mb-6">
        {trip.num_travelers} viaggiatori • Budget €{trip.budget_total}
      </p>

      {!itinerary ? (
        <button
          className="btn-primary text-lg px-10 py-4"
          onClick={generateItinerary}
          disabled={generating}
        >
          {generating ? "Generazione in corso..." : "Genera Itinerario AI"}
        </button>
      ) : (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Itinerario Generato</h2>
          <pre className="bg-black/40 rounded-xl p-6 text-sm whitespace-pre-wrap">
            {JSON.stringify(itinerary, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
