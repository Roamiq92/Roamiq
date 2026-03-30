"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase-browser";

/* ── Types ── */
interface Activity {
  time: string; name: string; description: string; duration: string;
  priceMin: number; priceMax: number; category: string; tip: string;
  bookingRequired: boolean; type?: string; cuisine?: string; googleMapsQuery?: string;
}
interface Day { day: number; date: string; theme: string; activities: Activity[]; }
interface Hotel {
  name: string; stars: number; zone: string; pricePerNight: number;
  why: string; googleHotelsQuery?: string;
}
interface Itinerary {
  destination: string; country: string; emoji: string; summary: string;
  totalCostMin: number; totalCostMax: number;
  days: Day[]; hotels: Hotel[]; localTips: string[]; bestFor: string;
}
interface TripRecord {
  id: string; destination: string; start_date: string; end_date: string;
  travelers: string; budget: string; itinerary: Itinerary;
}

/* ── Booking URL builders ── */
function googleHotelsUrl(hotelName: string, destination: string, checkIn: string, checkOut: string) {
  const query = encodeURIComponent(`${hotelName} ${destination}`);
  return `https://www.google.com/travel/hotels/entity/${query}?q=${query}&ved=0&checkin=${checkIn}&checkout=${checkOut}`;
}

function googleFlightsUrl(from: string, destination: string, date: string) {
  const f = encodeURIComponent(from);
  const t = encodeURIComponent(destination);
  return `https://www.google.com/flights?hl=it#flt=${f}.${t}.${date}`;
}

function getYourGuideUrl(activity: string, destination: string) {
  const q = encodeURIComponent(`${activity} ${destination}`);
  return `https://www.getyourguide.com/s/?q=${q}&partner_id=ROAMIQ`;
}

function googleMapsUrl(query: string) {
  return `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
}

function openTableUrl(restaurant: string, destination: string) {
  const q = encodeURIComponent(`${restaurant} ${destination}`);
  return `https://www.opentable.it/s/?term=${q}`;
}

/* ── Helpers ── */
const CATEGORY_CONFIG: Record<string, { icon: string; color: string }> = {
  cultura:   { icon: "🏛️", color: "#F5F0E8" }, food: { icon: "🍽️", color: "#FFF8EE" },
  natura:    { icon: "🌿", color: "#F0FDF4" }, nightlife: { icon: "🎶", color: "#FDF4FF" },
  shopping:  { icon: "🛍️", color: "#FFF1F2" }, sport: { icon: "⚡", color: "#ECFEFF" },
  relax:     { icon: "🧘", color: "#F0FDFA" }, trasporto: { icon: "🚇", color: "#F8FAFC" },
  alloggio:  { icon: "🏨", color: "#F0F9FF" },
};
function getCat(cat: string) { return CATEGORY_CONFIG[cat] ?? { icon: "📍", color: "#F5F0E8" }; }
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" });
}
function StarRating({ n }: { n: number }) {
  return <span className="trip-stars">{Array.from({ length: 5 }, (_, i) => <span key={i}>{i < n ? "★" : "☆"}</span>)}</span>;
}
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

/* ── Main ── */
export default function TripPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [trip, setTrip] = useState<TripRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(0);
  const [activeTab, setActiveTab] = useState<"itinerary"|"hotels"|"tips"|"book">("itinerary");

  useEffect(() => {
    async function load() {
      const cached = sessionStorage.getItem("roamiq_last_trip");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (id === "demo" || parsed.id === id) {
            setTrip(parsed as TripRecord);
            setLoading(false);
            return;
          }
        } catch { /* ignora */ }
      }
      if (id !== "demo") {
        try {
          const supabase = createBrowserClient();
          const { data, error } = await supabase.from("trips").select("*").eq("id", id).single();
          if (!error && data) { setTrip(data as TripRecord); setLoading(false); return; }
        } catch { /* ignora */ }
      }
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
          <Link href="/onboarding" className="trip-btn-ghost">↩ Modifica</Link>
          <button className="trip-btn-primary"
            onClick={() => setActiveTab("book")}>
            Prenota tutto →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <header className="trip-hero">
        <div className="trip-hero-bg" style={{ background: "linear-gradient(135deg, #1A1209 0%, #2D2416 50%, #1A1209 100%)" }} />
        <div className="trip-hero-content">
          <div className="trip-hero-badge">✨ Itinerario AI • Personalizzato per te</div>
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
          {([
            { id: "itinerary", label: "📅 Itinerario" },
            { id: "hotels",    label: "🏨 Hotel" },
            { id: "tips",      label: "💡 Consigli" },
            { id: "book",      label: "🎫 Prenota" },
          ] as const).map((tab) => (
            <button key={tab.id} className={`trip-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
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
                  const isRestaurant = act.type === "restaurant" || act.category === "food";
                  return (
                    <div key={i} className="trip-activity">
                      <div className="trip-activity-time-col">
                        <div className="trip-activity-time">{act.time}</div>
                        {i < currentDay.activities.length - 1 && <div className="trip-activity-line" />}
                      </div>
                      <div className={`trip-activity-card ${isRestaurant ? "restaurant-card" : ""}`}>
                        <div className="trip-activity-header">
                          <div className="trip-activity-icon" style={{ background: cat.color }}>{cat.icon}</div>
                          <div className="trip-activity-info">
                            <div className="trip-activity-name">
                              {act.name}
                              {isRestaurant && <span className="restaurant-tag">🍴 Ristorante</span>}
                            </div>
                            <div className="trip-activity-meta">
                              <span>⏱ {act.duration}</span>
                              <span>{act.priceMin === 0 && act.priceMax === 0 ? "Gratuito" : `€${act.priceMin}–€${act.priceMax}`}</span>
                              {act.cuisine && <span className="cuisine-tag">{act.cuisine}</span>}
                              {act.bookingRequired && <span className="trip-booking-badge">Prenotazione consigliata</span>}
                            </div>
                          </div>
                        </div>
                        <p className="trip-activity-desc">{act.description}</p>
                        {act.tip && <div className="trip-activity-tip"><span>💡</span><span>{act.tip}</span></div>}

                        {/* Booking buttons */}
                        <div className="trip-activity-actions">
                          {isRestaurant ? (
                            <>
                              <a href={googleMapsUrl(act.googleMapsQuery ?? `${act.name} ${itin.destination}`)}
                                target="_blank" rel="noopener noreferrer" className="trip-action-btn maps">
                                📍 Vedi su Maps
                              </a>
                              <a href={openTableUrl(act.name, itin.destination)}
                                target="_blank" rel="noopener noreferrer" className="trip-action-btn book">
                                🍽️ Prenota tavolo
                              </a>
                            </>
                          ) : act.bookingRequired ? (
                            <a href={getYourGuideUrl(act.name, itin.destination)}
                              target="_blank" rel="noopener noreferrer" className="trip-action-btn book">
                              🎫 Prenota biglietto
                            </a>
                          ) : (
                            <a href={googleMapsUrl(`${act.name} ${itin.destination}`)}
                              target="_blank" rel="noopener noreferrer" className="trip-action-btn maps">
                              📍 Vedi su Maps
                            </a>
                          )}
                        </div>
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
              <h2 className="trip-section-title">Hotel consigliati dall&apos;AI</h2>
              <p className="trip-section-sub">Prezzi diretti senza intermediari. Confronta e prenota al miglior prezzo.</p>
            </div>
            <div className="trip-hotels-grid">
              {itin.hotels.map((hotel, i) => (
                <div key={i} className={`trip-hotel-card ${i === 0 ? "featured" : ""}`}>
                  {i === 0 && <div className="trip-hotel-badge">⭐ Top pick AI</div>}
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
                    <div style={{ display: "flex", gap: "0.5rem", flexDirection: "column" }}>
                      <a
                        href={googleHotelsUrl(hotel.name, itin.destination, trip.start_date, trip.end_date)}
                        target="_blank" rel="noopener noreferrer"
                        className="trip-hotel-btn"
                        style={{ textDecoration: "none", textAlign: "center" }}
                      >
                        🏨 Google Hotels
                      </a>
                      <a
                        href={`https://www.google.com/maps/search/${encodeURIComponent(hotel.name + " " + itin.destination)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="trip-hotel-btn"
                        style={{ textDecoration: "none", textAlign: "center", opacity: 0.8 }}
                      >
                        📍 Vedi posizione
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Google Hotels embed note */}
            <div className="trip-hotel-note">
              <span>🔍</span>
              <span>Cliccando su &quot;Google Hotels&quot; vedrai tutti i prezzi disponibili, incluso il sito ufficiale dell&apos;hotel. Nessuna commissione aggiuntiva.</span>
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

        {/* BOOK */}
        {activeTab === "book" && (
          <div className="trip-book">
            <div className="trip-section-header">
              <h2 className="trip-section-title">Prenota il tuo viaggio</h2>
              <p className="trip-section-sub">Tutto in un posto. Prezzi reali, senza sorprese.</p>
            </div>

            {/* VOLI */}
            <div className="trip-book-section">
              <div className="trip-book-section-title">✈️ Voli</div>
              <div className="trip-book-card">
                <div className="trip-book-card-info">
                  <div className="trip-book-card-name">Google Flights</div>
                  <div className="trip-book-card-desc">Confronta tutti i voli disponibili al miglior prezzo</div>
                  <div className="trip-book-card-route">{trip.destination} · {formatDate(trip.start_date)} → {formatDate(trip.end_date)}</div>
                </div>
                <a
                  href={googleFlightsUrl(trip.destination, itin.destination, trip.start_date)}
                  target="_blank" rel="noopener noreferrer"
                  className="trip-book-btn"
                >
                  Cerca voli →
                </a>
              </div>
            </div>

            {/* HOTEL */}
            <div className="trip-book-section">
              <div className="trip-book-section-title">🏨 Hotel</div>
              {itin.hotels.slice(0, 2).map((hotel, i) => (
                <div key={i} className="trip-book-card">
                  <div className="trip-book-card-info">
                    <div className="trip-book-card-name">{hotel.name} {"★".repeat(hotel.stars)}</div>
                    <div className="trip-book-card-desc">{hotel.zone} · {hotel.why}</div>
                    <div className="trip-book-card-price">da €{hotel.pricePerNight}/notte</div>
                  </div>
                  <a
                    href={googleHotelsUrl(hotel.name, itin.destination, trip.start_date, trip.end_date)}
                    target="_blank" rel="noopener noreferrer"
                    className="trip-book-btn"
                  >
                    Verifica prezzi →
                  </a>
                </div>
              ))}
            </div>

            {/* ESPERIENZE */}
            <div className="trip-book-section">
              <div className="trip-book-section-title">🎭 Esperienze e biglietti</div>
              {itin.days.flatMap(d => d.activities).filter(a => a.bookingRequired && a.type !== "restaurant").slice(0, 4).map((act, i) => (
                <div key={i} className="trip-book-card">
                  <div className="trip-book-card-info">
                    <div className="trip-book-card-name">{act.name}</div>
                    <div className="trip-book-card-desc">{act.description?.slice(0, 80)}...</div>
                    <div className="trip-book-card-price">€{act.priceMin}–€{act.priceMax} p.p.</div>
                  </div>
                  <a
                    href={getYourGuideUrl(act.name, itin.destination)}
                    target="_blank" rel="noopener noreferrer"
                    className="trip-book-btn"
                  >
                    Prenota →
                  </a>
                </div>
              ))}
            </div>

            {/* RISTORANTI */}
            <div className="trip-book-section">
              <div className="trip-book-section-title">🍽️ Ristoranti consigliati</div>
              {itin.days.flatMap(d => d.activities).filter(a => a.type === "restaurant" || a.category === "food").slice(0, 4).map((act, i) => (
                <div key={i} className="trip-book-card">
                  <div className="trip-book-card-info">
                    <div className="trip-book-card-name">{act.name}</div>
                    <div className="trip-book-card-desc">{act.cuisine && `${act.cuisine} · `}{act.tip}</div>
                    <div className="trip-book-card-price">€{act.priceMin}–€{act.priceMax} p.p.</div>
                  </div>
                  <a
                    href={openTableUrl(act.name, itin.destination)}
                    target="_blank" rel="noopener noreferrer"
                    className="trip-book-btn"
                  >
                    Prenota tavolo →
                  </a>
                </div>
              ))}
            </div>

          </div>
        )}

      </main>

      {/* STICKY BAR */}
      <div className="trip-sticky-bar">
        <div className="trip-sticky-info">
          <span className="trip-sticky-dest">{itin.emoji} {itin.destination} · {totalDays} giorni</span>
          <span className="trip-sticky-cost">€{itin.totalCostMin}–{itin.totalCostMax} p.p.</span>
        </div>
        <div className="trip-sticky-actions">
          <Link href="/onboarding" className="trip-sticky-btn ghost">↩ Ricrea</Link>
          <button className="trip-sticky-btn primary" onClick={() => setActiveTab("book")}>
            Prenota tutto →
          </button>
        </div>
      </div>
    </div>
  );
}
