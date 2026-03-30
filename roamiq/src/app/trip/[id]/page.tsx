"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase-browser";

/* ── Types ─────────────────────────────────────────────────── */
interface Activity {
  time: string; name: string; description: string; duration: string;
  priceMin: number; priceMax: number; category: string; tip: string; bookingRequired: boolean;
}
interface Day { day: number; date: string; theme: string; activities: Activity[]; }
interface Hotel { name: string; stars: number; zone: string; pricePerNight: number; why: string; }
interface Itinerary {
  destination: string; country: string; emoji: string; summary: string;
  totalCostMin: number; totalCostMax: number;
  days: Day[]; hotels: Hotel[]; localTips: string[]; bestFor: string;
}
interface TripRecord {
  id: string; destination: string; start_date: string; end_date: string;
  travelers: string; budget: string; itinerary: Itinerary;
}

/* ── Helpers ── */
const CATEGORY_CONFIG: Record<string, { icon: string; color: string }> = {
  cultura:   { icon: "🏛️", color: "#F5F0E8" },
  food:      { icon: "🍽️", color: "#FFF8EE" },
  natura:    { icon: "🌿", color: "#F0FDF4" },
  nightlife: { icon: "🎶", color: "#FDF4FF" },
  shopping:  { icon: "🛍️", color: "#FFF1F2" },
  sport:     { icon: "⚡", color: "#ECFEFF" },
  relax:     { icon: "🧘", color: "#F0FDFA" },
  trasporto: { icon: "🚇", color: "#F8FAFC" },
  alloggio:  { icon: "🏨", color: "#F0F9FF" },
};
function getCat(cat: string) { return CATEGORY_CONFIG[cat] ?? { icon: "📍", color: "#F5F0E8" }; }
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" });
}
function StarRating({ n }: { n: number }) {
  return (
    <span className="trip-stars">
      {Array.from({ length: 5 }, (_, i) => <span key={i}>{i < n ? "★" : "☆"}</span>)}
    </span>
  );
}

/* ── Skeleton ── */
function TripSkeleton() {
  return (
    <div className="trip-skeleton">
      <div className="sk-hero" />
      <div className="sk-body">
        <div className="sk-line sk-title" /><div className="sk-line sk-sub" /><div className="sk-line sk-sub short" />
        <div className="sk-cards">{[1,2,3].map(i => <div key={i} className="sk-card" />)}</div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function TripPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [trip, setTrip] = useState<TripRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(0);
  const [activeTab, setActiveTab] = useState<"itinerary"|"hotels"|"tips">("itinerary");

  useEffect(() => {
    async function load() {
      // Prima controlla sessionStorage (funziona sempre, anche per demo)
      const cached = sessionStorage.getItem("roamiq_last_trip");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          // Usa il cache se l'id corrisponde o se è demo
          if (id === "demo" || parsed.id === id) {
            setTrip(parsed as TripRecord);
            setLoading(false);
            return;
          }
        } catch { /* ignora */ }
      }

      // Se non è demo, prova Supabase
      if (id !== "demo") {
        try {
          const supabase = createBrowserClient();
          const { data, error } = await supabase
            .from("trips").select("*").eq("id", id).single();
          if (!error && data) {
            setTrip(data as TripRecord);
            setLoading(false);
            return;
          }
        } catch { /* ignora */ }
      }

      // Niente trovato → torna all'onboarding
      router.push("/onboarding");
    }
    load();
  }, [id, router]);

  if (loading) return <TripSkeleton />;
  if (!trip) return null;

  const itin = trip.itinerary;
  const currentDay = itin.days[activeDay];
  const totalDays = itin.days.length;
  const daysCost = Math.round(itin.totalCostMin / totalDays);

  return (
    <div className="trip-page">
      {/* NAV */}
      <nav className="trip-nav">
        <Link href="/" className="ob-logo">ROAM<span>IQ</span></Link>
        <div className="trip-nav-meta">
          <span className="trip-nav-dest">{itin.emoji} {itin.destination}</span>
          <span className="trip-nav-sep">·</span>
          <span>{totalDays} giorni</span>
        </div>
        <div className="trip-nav-actions">
          <button className="trip-btn-ghost" onClick={() => window.print()}>Stampa</button>
          <button className="trip-btn-primary"
            onClick={() => document.getElementById("booking-section")?.scrollIntoView({ behavior: "smooth" })}>
            Prenota tutto →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <header className="trip-hero">
        <div className="trip-hero-bg" style={{ background: "linear-gradient(135deg, #1A1209 0%, #2D2416 50%, #1A1209 100%)" }} />
        <div className="trip-hero-content">
          <div className="trip-hero-badge">✨ Itinerario AI generato per te</div>
          <h1 className="trip-hero-title">{itin.emoji} {itin.destination}</h1>
          <p className="trip-hero-summary">{itin.summary}</p>
          <div className="trip-hero-meta">
            <div className="trip-meta-item"><span className="trip-meta-icon">📅</span><span>{formatDate(trip.start_date)} → {formatDate(trip.end_date)}</span></div>
            <div className="trip-meta-sep" />
            <div className="trip-meta-item"><span className="trip-meta-icon">👥</span><span className="capitalize">{trip.travelers}</span></div>
            <div className="trip-meta-sep" />
            <div className="trip-meta-item"><span className="trip-meta-icon">💶</span><span>€{itin.totalCostMin}–€{itin.totalCostMax} p.p.</span></div>
          </div>
        </div>
        <div className="trip-cost-card">
          <div className="trip-cost-label">Costo totale stimato p.p.</div>
          <div className="trip-cost-range">€{itin.totalCostMin} – €{itin.totalCostMax}</div>
          <div className="trip-cost-daily">~€{daysCost}/giorno</div>
          <div className="trip-cost-note">Volo escluso · AI ottimizzato</div>
        </div>
      </header>

      {/* TABS */}
      <div className="trip-tabs-bar">
        <div className="trip-tabs">
          {(["itinerary","hotels","tips"] as const).map((tab) => (
            <button key={tab} className={`trip-tab ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
              {tab === "itinerary" && "📅 Itinerario"}
              {tab === "hotels"    && "🏨 Hotel"}
              {tab === "tips"      && "💡 Consigli locali"}
            </button>
          ))}
        </div>
      </div>

      {/* BODY */}
      <main className="trip-main">

        {/* ITINERARY */}
        {activeTab === "itinerary" && (
          <div className="trip-itinerary">
            <div className="trip-day-selector">
              {itin.days.map((d, i) => (
                <button key={i} className={`trip-day-btn ${activeDay === i ? "active" : ""}`} onClick={() => setActiveDay(i)}>
                  <span className="trip-day-num">Giorno {d.day}</span>
                  <span className="trip-day-date">{formatDate(d.date)}</span>
                  <span className="trip-day-theme">{d.theme}</span>
                </button>
              ))}
            </div>
            <div className="trip-activities-panel">
              <div className="trip-day-header">
                <h2 className="trip-day-title">Giorno {currentDay.day} — {currentDay.theme}</h2>
                <span className="trip-day-date-badge">{formatDate(currentDay.date)}</span>
              </div>
              <div className="trip-timeline">
                {currentDay.activities.map((act, i) => {
                  const cat = getCat(act.category);
                  return (
                    <div key={i} className="trip-activity">
                      <div className="trip-activity-time-col">
                        <div className="trip-activity-time">{act.time}</div>
                        {i < currentDay.activities.length - 1 && <div className="trip-activity-line" />}
                      </div>
                      <div className="trip-activity-card">
                        <div className="trip-activity-header">
                          <div className="trip-activity-icon" style={{ background: cat.color }}>{cat.icon}</div>
                          <div className="trip-activity-info">
                            <div className="trip-activity-name">{act.name}</div>
                            <div className="trip-activity-meta">
                              <span>⏱ {act.duration}</span>
                              <span>{act.priceMin === 0 && act.priceMax === 0 ? "Gratuito" : act.priceMin === act.priceMax ? `€${act.priceMin}` : `€${act.priceMin}–€${act.priceMax}`}</span>
                              {act.bookingRequired && <span className="trip-booking-badge">Prenotazione consigliata</span>}
                            </div>
                          </div>
                        </div>
                        <p className="trip-activity-desc">{act.description}</p>
                        {act.tip && (
                          <div className="trip-activity-tip"><span>💡</span><span>{act.tip}</span></div>
                        )}
                        {act.bookingRequired && (
                          <button className="trip-book-activity">Prenota questa attività →</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="trip-day-nav">
                {activeDay > 0 && <button className="trip-day-nav-btn" onClick={() => setActiveDay(activeDay - 1)}>← Giorno {activeDay}</button>}
                {activeDay < itin.days.length - 1 && <button className="trip-day-nav-btn next" onClick={() => setActiveDay(activeDay + 1)}>Giorno {activeDay + 2} →</button>}
              </div>
            </div>
          </div>
        )}

        {/* HOTELS */}
        {activeTab === "hotels" && (
          <div className="trip-hotels">
            <div className="trip-section-header">
              <h2 className="trip-section-title">Hotel consigliati</h2>
              <p className="trip-section-sub">Selezionati dall&apos;AI in base al tuo profilo e budget.</p>
            </div>
            <div className="trip-hotels-grid">
              {itin.hotels.map((hotel, i) => (
                <div key={i} className={`trip-hotel-card ${i === 0 ? "featured" : ""}`}>
                  {i === 0 && <div className="trip-hotel-badge">⭐ Consigliato dall&apos;AI</div>}
                  <div className="trip-hotel-header">
                    <div>
                      <div className="trip-hotel-name">{hotel.name}</div>
                      <div className="trip-hotel-zone">📍 {hotel.zone}</div>
                    </div>
                    <StarRating n={hotel.stars} />
                  </div>
                  <p className="trip-hotel-why">{hotel.why}</p>
                  <div className="trip-hotel-footer">
                    <div>
                      <div className="trip-hotel-price">€{hotel.pricePerNight}</div>
                      <div className="trip-hotel-price-label">a notte</div>
                    </div>
                    <button className="trip-hotel-btn">Verifica disponibilità →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TIPS */}
        {activeTab === "tips" && (
          <div className="trip-tips">
            <div className="trip-section-header">
              <h2 className="trip-section-title">Consigli locali autentici</h2>
              <p className="trip-section-sub">Quello che i turisti non sanno.</p>
            </div>
            <div className="trip-tips-grid">
              {itin.localTips.map((tip, i) => (
                <div key={i} className="trip-tip-card">
                  <div className="trip-tip-num">{String(i + 1).padStart(2, "0")}</div>
                  <p className="trip-tip-text">{tip}</p>
                </div>
              ))}
            </div>
            <div className="trip-bestfor">
              <span className="trip-bestfor-label">Perfetto per</span>
              <span className="trip-bestfor-value">{itin.bestFor}</span>
            </div>
          </div>
        )}

        {/* BOOKING */}
        <section id="booking-section" className="trip-booking-section">
          <div className="trip-booking-inner">
            <div>
              <div className="trip-booking-eyebrow">Pronto a partire?</div>
              <h2 className="trip-booking-title">Prenota tutto in un click</h2>
              <p className="trip-booking-sub">Volo, hotel ed esperienze coordinati dall&apos;AI al miglior prezzo.</p>
            </div>
            <div className="trip-booking-cards">
              {[
                { icon: "✈️", title: "Volo", note: `Da ${trip.start_date}` },
                { icon: "🏨", title: "Hotel", note: itin.hotels[0]?.name ?? "Selezione AI" },
                { icon: "🎭", title: "Esperienze", note: "Skip-the-line incluso" },
              ].map((b) => (
                <div key={b.title} className="trip-booking-card">
                  <div className="trip-booking-icon">{b.icon}</div>
                  <div className="trip-booking-card-title">{b.title}</div>
                  <div className="trip-booking-card-note">{b.note}</div>
                  <button className="trip-booking-btn">Prenota →</button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* STICKY BAR */}
      <div className="trip-sticky-bar">
        <div className="trip-sticky-info">
          <span className="trip-sticky-dest">{itin.emoji} {itin.destination} · {totalDays} giorni</span>
          <span className="trip-sticky-cost">€{itin.totalCostMin}–{itin.totalCostMax} p.p.</span>
        </div>
        <div className="trip-sticky-actions">
          <Link href="/onboarding" className="trip-sticky-btn ghost">↩ Modifica</Link>
          <button className="trip-sticky-btn primary"
            onClick={() => document.getElementById("booking-section")?.scrollIntoView({ behavior: "smooth" })}>
            Prenota tutto →
          </button>
        </div>
      </div>
    </div>
  );
}
