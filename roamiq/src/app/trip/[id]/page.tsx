"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "../../../lib/supabase-browser";
import { useParams } from "next/navigation";

export default function TripPage() {
  const params = useParams();
  const tripId = params.id;

  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [itinerary, setItinerary] = useState<any>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadTrip();
  }, []);

  const loadTrip = async () => {
    const { data } = await supabaseBrowser
      .from("trip_requests")
      .select("*")
      .eq("id", tripId)
      .single();

    setTrip(data);
    setLoading(false);
  };

  const generateItinerary = async () => {
    setGenerating(true);

    const res = await fetch("/api/generate-itinerary", {
      method: "POST",
      body: JSON.stringify(trip),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    setItinerary(data);
    setGenerating(false);
  };

  if (loading) return <p className="text-center mt-20">Caricamento...</p>;

  return (
    <div className="min-h-screen text-white px-6 py-20">
      <h1 className="text-4xl font-bold mb-2">
        Viaggio a {trip.destination}
      </h1>
      <p className="text-gray-400 mb-8">
        {trip.num_travelers} viaggiatori – Budget €{trip.budget_total}
      </p>

      {!itinerary ? (
        <button
          onClick={generateItinerary}
          className="btn-primary text-xl px-10 py-4"
          disabled={generating}
        >
          {generating ? "Generazione in corso..." : "Genera Itinerario AI"}
        </button>
      ) : (
        <div className="mt-10 space-y-10">
          <pre className="bg-black/40 p-6 rounded-xl overflow-x-auto text-sm">
            {JSON.stringify(itinerary, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
