"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase-browser";

interface Trip {
  id: string;
  destination: string;
  start_date: string;
  end_date: string;
  travelers: string;
  budget: string;
  itinerary: { emoji: string; summary: string; totalCostMin: number; totalCostMax: number };
  created_at: string;
}

function TripCard({ trip }: { trip: Trip }) {
  const days = Math.ceil(
    (new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / 86400000
  );
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("it-IT", { day: "numeric", month: "short" });

  return (
    <Link href={`/trip/${trip.id}`} className="dash-trip-card">
      <div className="dash-trip-emoji">{trip.itinerary?.emoji ?? "🌍"}</div>
      <div className="dash-trip-body">
        <div className="dash-trip-dest">{trip.destination}</div>
        <div className="dash-trip-meta">
          {fmt(trip.start_date)} → {fmt(trip.end_date)} · {days} giorni · {trip.travelers}
        </div>
        {trip.itinerary?.summary && (
          <div className="dash-trip-summary">{trip.itinerary.summary}</div>
        )}
      </div>
      <div className="dash-trip-right">
        <div className="dash-trip-cost">
          €{trip.itinerary?.totalCostMin ?? "—"}–{trip.itinerary?.totalCostMax ?? "—"}
        </div>
        <div className="dash-trip-cost-label">p.p.</div>
        <div className="dash-trip-arrow">→</div>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserName(user.user_metadata?.full_name?.split(" ")[0] ?? "Viaggiatore");

      const { data } = await supabase
        .from("trips")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setTrips((data as Trip[]) ?? []);
      setLoading(false);
    }
    load();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="dash-page">
      {/* NAV */}
      <nav className="trip-nav">
        <Link href="/" className="ob-logo">ROAM<span>IQ</span></Link>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "1rem" }}>
          <span className="dash-greeting">Ciao, {userName} 👋</span>
          <Link href="/onboarding" className="nav-cta">+ Nuovo viaggio</Link>
          <button className="trip-btn-ghost" onClick={handleLogout}>Esci</button>
        </div>
      </nav>

      <main className="dash-main">
        {/* Header */}
        <div className="dash-header">
          <div>
            <h1 className="dash-title">I tuoi viaggi</h1>
            <p className="dash-sub">Tutti gli itinerari AI che hai generato.</p>
          </div>
          <Link href="/onboarding" className="btn-primary" style={{ textDecoration: "none" }}>
            🚀 Pianifica nuovo viaggio
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="dash-loading">
            <span className="ob-spinner" style={{ borderTopColor: "var(--blue)", borderColor: "var(--border)", width: 32, height: 32 }} />
          </div>
        ) : trips.length === 0 ? (
          <div className="dash-empty">
            <div className="dash-empty-icon">🗺️</div>
            <h2 className="dash-empty-title">Nessun viaggio ancora</h2>
            <p className="dash-empty-sub">Pianifica il tuo primo itinerario AI in 30 secondi.</p>
            <Link href="/onboarding" className="btn-primary" style={{ textDecoration: "none", display: "inline-block", marginTop: "1.2rem" }}>
              Inizia ora →
            </Link>
          </div>
        ) : (
          <div className="dash-trips-list">
            {trips.map((t) => <TripCard key={t.id} trip={t} />)}
          </div>
        )}
      </main>
    </div>
  );
}
