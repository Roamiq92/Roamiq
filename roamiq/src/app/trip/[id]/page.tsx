"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase-browser";

/* ── Types ─────────────────────────────────────────────────── */
interface Activity {
  time: string;
  name: string;
  description: string;
  duration: string;
  priceMin: number;
  priceMax: number;
  category: string;
  tip: string;
  bookingRequired: boolean;
}

interface Day {
  day: number;
  date: string;
  theme: string;
  activities: Activity[];
}

interface Hotel {
  name: string;
  stars: number;
  zone: string;
  pricePerNight: number;
  why: string;
}

interface Itinerary {
  destination: string;
  country: string;
  emoji: string;
  summary: string;
  totalCostMin: number;
  totalCostMax: number;
  days: Day[];
  hotels: Hotel[];
  localTips: string[];
  bestFor: string;
}

interface TripRecord {
  id: string;
  destination: string;
  start_date: string;
  end_date: string;
  travelers: string;
  budget: string;
  itinerary: Itinerary;
}

/* ── Helpers ────────────────────────────────────────────────── */
const CATEGORY_CONFIG: Record<string, { icon: string; color: string }> = {
  cultura:    { icon: "🏛️", color: "#EFF4FF" },
  food:       { icon: "🍽️", color: "#FFFBEB" },
  natura:     { icon: "🌿", color: "#F0FDF4" },
  nightlife:  { icon: "🎶", color: "#FDF4FF" },
  shopping:   { icon: "🛍️", color: "#FFF1F2" },
  sport:      { icon: "⚡", color: "#ECFEFF" },
  relax:      { icon: "🧘", color: "#F0FDFA" },
  trasporto:  { icon: "🚇", color: "#F8FAFC" },
  alloggio:   { icon: "🏨", color: "#F0F9FF" },
};

function getCat(cat: string) {
  return CATEGORY_CONFIG[cat] ?? { icon: "📍", color: "#F8FAFC" };
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("it-IT", {
    weekday: "short", day: "numeric", month: "short",
  });
}

function StarRating({ n }: { n: number }) {
  return (
    <span className="trip-stars">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i}>{i < n ? "\u2605" : "\u2606"}</span>
      ))}
    </span>
  );
}

/* ── Loading skeleton ───────────────────────────────────────── */
function TripSkeleton() {
  return (
    <div className="trip-skeleton">
      <div className="sk-hero" />
      <div className="sk-body">
        <div className="sk-line sk-title" />
        <div className="sk-line sk-sub" />
        <div className="sk-line sk-sub short" />
        <div className="sk-cards">
          {[1,2,3].map(i => <div key={i} className="sk-card" />)}
        </div>
      </div>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────── */
export default function TripPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [trip, setTrip] = useState<TripRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(0);
  const [activeTab, setActiveTab] = useState<"itinerary" | "hotels" | "tips">("itinerary");

  useEffect(() => {
    async function load() {
      if (id === "demo") {
        // Demo fallback: retrieve from session storage if available
        const raw = sessionStorage.getItem("roamiq_demo_trip");
        if (raw) {
          setTrip(JSON.parse(raw));
        }
        setLoading(false);
        return;
      }
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        router.push("/onboarding");
        return;
      }
      setTrip(data as TripRecord);
      setLoading(false);
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
      {/* ── TOP NAV ── */}
      <nav className="trip-nav">
        <Link href="/" className="ob-logo">ROAM<span>IQ</span></Link>
        <div className="trip-nav-meta">
          <span className="trip-nav-dest">{itin.emoji} {itin.destination}</span>
          <span className="trip-nav-sep">·</span>
          <span className="trip-nav-days">{totalDays} giorni</span>
        </div>
        <div className="trip-nav-actions">
          <button className="trip-btn-ghost" onClick={() => window.print()}>
            Stampa
          </button>
          <button
            className="trip-btn-primary"
            onClick={() => document.getElementById("booking-section")?.scrollIntoView({ behavior: "smooth" })}
          >
            Prenota tutto →
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <header className="trip-hero">
        <div className="trip-hero-bg" style={{ background: `linear-gradient(135deg, #0D1B2A 0%, #1e3a5f 50%, #0D1B2A 100%)` }} />
        <div className="trip-hero-content">
          <div className="trip-hero-badge">✨ Itinerario AI generato per te</div>
          <h1 className="trip-hero-title">
            {itin.emoji} {itin.destination}
          </h1>
          <p className="trip-hero-summary">{itin.summary}</p>
          <div className="trip-hero-meta">
            <div className="trip-meta-item">
              <span className="trip-meta-icon">📅</span>
              <span>{formatDate(trip.start_date)} → {formatDate(trip.end_date)}</span>
            </div>
            <div className="trip-meta-sep" />
            <div className="trip-meta-item">
              <span className="trip-meta-icon">👥</span>
              <span className="capitalize">{trip.travelers}</span>
            </div>
            <div className="trip-meta-sep" />
            <div className="trip-meta-item">
              <span className="trip-meta-icon">💶</span>
              <span>€{itin.totalCostMin}–€{itin.totalCostMax} p.p.</span>
            </div>
          </div>
        </div>
        {/* Cost card floating */}
        <div className="trip-cost-card">
          <div className="trip-cost-label">Costo totale stimato p.p.</div>
          <div className="trip-cost-range">€{itin.totalCostMin} – €{itin.totalCostMax}</div>
          <div className="trip-cost-daily">~€{daysCost}/giorno</div>
          <div className="trip-cost-note">Volo escluso · Aggiornato in tempo reale</div>
        </div>
      </header>

      {/* ── TABS ── */}
      <div className="trip-tabs-bar">
        <div className="trip-tabs">
          {(["itinerary", "hotels", "tips"] as const).map((tab) => (
            <button
              key={tab}
              className={`trip-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "itinerary" && "📅 Itinerario"}
              {tab === "hotels"    && "🏨 Hotel"}
              {tab === "tips"      && "💡 Consigli locali"}
            </button>
          ))}
        </div>
      </div>

      {/* ── BODY ── */}
      <main className="trip-main">

        {/* ═══ ITINERARY TAB ═══ */}
        {activeTab === "itinerary" && (
          <div className="trip-itinerary">

            {/* Day selector */}
            <div className="trip-day-selector">
              {itin.days.map((d, i) => (
                <button
                  key={i}
                  className={`trip-day-btn ${activeDay === i ? "active" : ""}`}
                  onClick={() => setActiveDay(i)}
                >
                  <span className="trip-day-num">Giorno {d.day}</span>
                  <span className="trip-day-date">{formatDate(d.date)}</span>
                  <span className="trip-day-theme">{d.theme}</span>
                </button>
              ))}
            </div>

            {/* Activities */}
            <div className="trip-activities-panel">
              <div className="trip-day-header">
                <h2 className="trip-day-title">
                  Giorno {currentDay.day} — {currentDay.theme}
                </h2>
                <span className="trip-day-date-badge">{formatDate(currentDay.date)}</span>
              </div>

              <div className="trip-timeline">
                {currentDay.activities.map((act, i) => {
                  const cat = getCat(act.category);
                  return (
                    <div key={i} className="trip-activity">
                      {/* Time + line */}
                      <div className="trip-activity-time-col">
                        <div className="trip-activity-time">{act.time}</div>
                        {i < currentDay.activities.length - 1 && (
                          <div className="trip-activity-line" />
                        )}
                      </div>
                      {/* Card */}
                      <div className="trip-activity-card">
                        <div className="trip-activity-header">
                          <div
                            className="trip-activity-icon"
                            style={{ background: cat.color }}
                          >
                            {cat.icon}
                          </div>
                          <div className="trip-activity-info">
                            <div className="trip-activity-name">{act.name}</div>
                            <div className="trip-activity-meta">
                              <span>⏱ {act.duration}</span>
                              <span>
                                {act.priceMin === 0 && act.priceMax === 0
                                  ? "Gratuito"
                                  : act.priceMin === act.priceMax
                                  ? `€${act.priceMin}`
                                  : `€${act.priceMin}–€${act.priceMax}`}
                              </span>
                              {act.bookingRequired && (
                                <span className="trip-booking-badge">Prenotazione consigliata</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="trip-activity-desc">{act.description}</p>
                        {act.tip && (
                          <div className="trip-activity-tip">
                            <span>💡</span>
                            <span>{act.tip}</span>
                          </div>
                        )}
                        {act.bookingRequired && (
                          <button className="trip-book-activity">
                            Prenota questa attività →
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Day navigation */}
              <div className="trip-day-nav">
                {activeDay > 0 && (
                  <button className="trip-day-nav-btn" onClick={() => setActiveDay(activeDay - 1)}>
                    ← Giorno {activeDay}
                  </button>
                )}
                {activeDay < itin.days.length - 1 && (
                  <button className="trip-day-nav-btn next" onClick={() => setActiveDay(activeDay + 1)}>
                    Giorno {activeDay + 2} →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══ HOTELS TAB ═══ */}
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

        {/* ═══ TIPS TAB ═══ */}
        {activeTab === "tips" && (
          <div className="trip-tips">
            <div className="trip-section-header">
              <h2 className="trip-section-title">Consigli locali autentici</h2>
              <p className="trip-section-sub">Quello che i turisti non sanno — curato dall&apos;AI e da guide locali.</p>
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
              <span className="trip-bestfor-label">Questo viaggio è perfetto per</span>
              <span className="trip-bestfor-value">{itin.bestFor}</span>
            </div>
          </div>
        )}

        {/* ═══ BOOKING SECTION ═══ */}
        <section id="booking-section" className="trip-booking-section">
          <div className="trip-booking-inner">
            <div>
              <div className="trip-booking-eyebrow">Pronto a partire?</div>
              <h2 className="trip-booking-title">Prenota tutto in un click</h2>
              <p className="trip-booking-sub">
                L&apos;AI ottimizza prezzi e disponibilità in tempo reale. Volo, hotel ed esperienze coordinati.
              </p>
            </div>
            <div className="trip-booking-cards">
              <div className="trip-booking-card">
                <div className="trip-booking-icon">✈️</div>
                <div className="trip-booking-card-title">Volo</div>
                <div className="trip-booking-card-note">Migliori tariffe in tempo reale</div>
                <button className="trip-booking-btn">Cerca voli</button>
              </div>
              <div className="trip-booking-card">
                <div className="trip-booking-icon">🏨</div>
                <div className="trip-booking-card-title">Hotel</div>
                <div className="trip-booking-card-note">{itin.hotels[0]?.name ?? "Selezione AI"}</div>
                <button className="trip-booking-btn">Prenota hotel</button>
              </div>
              <div className="trip-booking-card">
                <div className="trip-booking-icon">🎭</div>
                <div className="trip-booking-card-title">Esperienze</div>
                <div className="trip-booking-card-note">Skip-the-line incluso</div>
                <button className="trip-booking-btn">Prenota attività</button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── BOTTOM STICKY BAR ── */}
      <div className="trip-sticky-bar">
        <div className="trip-sticky-info">
          <span className="trip-sticky-dest">{itin.emoji} {itin.destination} · {totalDays} giorni</span>
          <span className="trip-sticky-cost">€{itin.totalCostMin}–{itin.totalCostMax} p.p.</span>
        </div>
        <div className="trip-sticky-actions">
          <Link href="/onboarding" className="trip-sticky-btn ghost">
            ↩ Modifica
          </Link>
          <button
            className="trip-sticky-btn primary"
            onClick={() => document.getElementById("booking-section")?.scrollIntoView({ behavior: "smooth" })}
          >
            Prenota tutto →
          </button>
        </div>
      </div>
    </div>
  );
}
