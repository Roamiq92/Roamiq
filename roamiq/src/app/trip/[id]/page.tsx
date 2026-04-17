"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase-browser";

/* ── Types ── */
interface Activity {
  time: string; name: string; description: string; duration: string;
  priceMin: number; priceMax: number; category: string; tip: string;
  bookingRequired: boolean; type?: string; cuisine?: string;
}
interface Day { day: number; date: string; theme: string; activities: Activity[]; }
interface Hotel {
  name: string; stars: number; zone: string; pricePerNight: number;
  why: string; highlights?: string[];
}
interface Transport {
  type: string; from: string; to: string; duration: string;
  estimatedPriceMin: number; estimatedPriceMax: number;
  operators?: string[]; tip?: string;
}
interface Itinerary {
  destination: string; country: string; emoji: string; summary: string;
  totalCostMin: number; totalCostMax: number;
  transport?: { outbound?: Transport; return?: Transport; local?: string };
  days: Day[]; hotels: Hotel[]; localTips: string[]; bestFor: string;
}
interface TripRecord {
  id: string; destination: string; start_date: string; end_date: string;
  travelers: string; budget: string; itinerary: Itinerary;
}

/* ── URL builders ── */
function bookingUrl(dest: string, checkIn: string, checkOut: string, travelers: string) {
  const adults = travelers === "coppia" ? 2 : travelers === "famiglia" ? 3 : travelers === "amici" ? 3 : 1;
  return `https://www.booking.com/searchresults.it.html?ss=${encodeURIComponent(dest)}&checkin=${checkIn}&checkout=${checkOut}&group_adults=${adults}&no_rooms=1&lang=it&selected_currency=EUR`;
}
function getYourGuideUrl(activity: string, dest: string) {
  return `https://www.getyourguide.it/s/?q=${encodeURIComponent(activity + " " + dest)}&currency=EUR`;
}
function skyscannerUrl(from: string, to: string, date: string, travelers: string) {
  const adults = travelers === "coppia" ? 2 : travelers === "famiglia" ? 3 : travelers === "amici" ? 3 : 1;
  return `https://www.skyscanner.it/transport/voli/${encodeURIComponent(from)}/${encodeURIComponent(to)}/${date.replace(/-/g, "")}/?adults=${adults}&currency=EUR`;
}
function trenitaliUrl(from: string, to: string, date: string) {
  return `https://www.trenitalia.com/it/acquista/promo-last-minute.html?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`;
}
function openTableUrl(name: string, dest: string, date: string, size: number) {
  return `https://www.opentable.it/s/?term=${encodeURIComponent(name + " " + dest)}&covers=${size}&dateTime=${date}T20:00`;
}
function googleMapsUrl(q: string) {
  return `https://www.google.com/maps/search/${encodeURIComponent(q)}`;
}

/* ── Helpers ── */
const CAT: Record<string, { icon: string; color: string }> = {
  cultura:   { icon: "🏛️", color: "#F5F0E8" }, food:      { icon: "🍽️", color: "#FFF8EE" },
  natura:    { icon: "🌿", color: "#F0FDF4" }, nightlife: { icon: "🎶", color: "#FDF4FF" },
  shopping:  { icon: "🛍️", color: "#FFF1F2" }, sport:     { icon: "⚡", color: "#ECFEFF" },
  relax:     { icon: "🧘", color: "#F0FDFA" }, trasporto: { icon: "🚇", color: "#F8FAFC" },
  alloggio:  { icon: "🏨", color: "#F0F9FF" },
};
const getCat = (c: string) => CAT[c] ?? { icon: "📍", color: "#F5F0E8" };
const fmt = (d: string) => new Date(d).toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" });
const partySize = (t: string) => t === "coppia" ? 2 : t === "famiglia" ? 4 : t === "amici" ? 4 : 1;

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
function LoginGate({ tab }: { tab: string }) {
  return (
    <div className="trip-gate">
      <div className="trip-gate-card">
        <div className="trip-gate-icon">{tab === "hotels" ? "🏨" : tab === "transport" ? "✈️" : "🎫"}</div>
        <h3 className="trip-gate-title">
          {tab === "hotels" ? "Vedi gli hotel selezionati" : tab === "transport" ? "Vedi voli e trasporti" : "Prenota il tuo viaggio"}
        </h3>
        <p className="trip-gate-sub">
          Crea un account gratuito per accedere a hotel, trasporti e prenotazioni — tutto in un posto.
        </p>
        <div className="trip-gate-actions">
          <Link href="/register" className="trip-gate-btn-primary">Registrati gratis →</Link>
          <Link href="/login" className="trip-gate-btn-ghost">Ho già un account</Link>
        </div>
        <p className="trip-gate-note">✓ Gratis · ✓ Nessuna carta · ✓ 30 secondi</p>
      </div>
    </div>
  );
}

export default function TripPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [trip, setTrip] = useState<TripRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeDay, setActiveDay] = useState(0);
  const [activeTab, setActiveTab] = useState<"itinerary"|"transport"|"hotels"|"tips"|"book">("itinerary");

  useEffect(() => {
    async function load() {
      try {
        const supabase = createBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();
        setIsLoggedIn(!!user);
      } catch { /* ignora */ }

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
  const size = partySize(trip.travelers);
  const isLocked = (tab: string) => !isLoggedIn && ["hotels", "transport", "book"].includes(tab);

  const allRestaurants = itin.days.flatMap(d => d.activities).filter(a => a.type === "restaurant" || a.category === "food");
  const allBookable = itin.days.flatMap(d => d.activities).filter(a => a.bookingRequired && a.type !== "restaurant" && a.category !== "food");
  const transport = itin.transport;

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
          {isLoggedIn
            ? <Link href="/dashboard" className="trip-btn-ghost">I miei viaggi</Link>
            : <Link href="/register" className="trip-btn-ghost">Registrati gratis</Link>}
          <button className="trip-btn-primary" onClick={() => setActiveTab("book")}>Prenota tutto →</button>
        </div>
      </nav>

      {/* HERO */}
      <header className="trip-hero">
        <div className="trip-hero-bg" style={{ background: "linear-gradient(135deg, #1A1209 0%, #2D2416 50%, #1A1209 100%)" }} />
        <div className="trip-hero-content">
          <div className="trip-hero-badge">✨ Itinerario AI · Personalizzato per te</div>
          <h1 className="trip-hero-title">{itin.emoji} {itin.destination}</h1>
          <p className="trip-hero-summary">{itin.summary}</p>
          <div className="trip-hero-meta">
            <div className="trip-meta-item"><span className="trip-meta-icon">📅</span><span>{fmt(trip.start_date)} → {fmt(trip.end_date)}</span></div>
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
          <div className="trip-cost-note">AI ottimizzato · prezzi indicativi</div>
        </div>
      </header>

      {/* TABS */}
      <div className="trip-tabs-bar">
        <div className="trip-tabs">
          {([
            { id: "itinerary",  label: "📅 Itinerario" },
            { id: "transport",  label: isLocked("transport") ? "🔒 Trasporti" : "✈️ Trasporti" },
            { id: "hotels",     label: isLocked("hotels") ? "🔒 Hotel" : "🏨 Hotel" },
            { id: "tips",       label: "💡 Consigli" },
            { id: "book",       label: isLocked("book") ? "🔒 Prenota" : "🎫 Prenota" },
          ] as const).map((tab) => (
            <button key={tab.id}
              className={`trip-tab ${activeTab === tab.id ? "active" : ""} ${isLocked(tab.id) ? "locked" : ""}`}
              onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="trip-main">

        {/* ═══ ITINERARY ═══ */}
        {activeTab === "itinerary" && (
          <div className="trip-itinerary">
            <div className="trip-day-selector">
              {itin.days.map((d, i) => (
                <button key={i} className={`trip-day-btn ${activeDay === i ? "active" : ""}`} onClick={() => setActiveDay(i)}>
                  <span className="trip-day-num">Giorno {d.day}</span>
                  <span className="trip-day-date">{fmt(d.date)}</span>
                  <span className="trip-day-theme">{d.theme}</span>
                </button>
              ))}
            </div>
            <div className="trip-activities-panel">
              <div className="trip-day-header">
                <h2 className="trip-day-title">Giorno {currentDay.day} — {currentDay.theme}</h2>
                <span className="trip-day-date-badge">{fmt(currentDay.date)}</span>
              </div>
              <div className="trip-timeline">
                {currentDay.activities.map((act, i) => {
                  const cat = getCat(act.category);
                  const isRest = act.type === "restaurant" || act.category === "food";
                  return (
                    <div key={i} className="trip-activity">
                      <div className="trip-activity-time-col">
                        <div className="trip-activity-time">{act.time}</div>
                        {i < currentDay.activities.length - 1 && <div className="trip-activity-line" />}
                      </div>
                      <div className={`trip-activity-card ${isRest ? "restaurant-card" : ""}`}>
                        <div className="trip-activity-header">
                          <div className="trip-activity-icon" style={{ background: cat.color }}>{cat.icon}</div>
                          <div className="trip-activity-info">
                            <div className="trip-activity-name">
                              {act.name}
                              {isRest && <span className="restaurant-tag">🍴 Ristorante</span>}
                            </div>
                            <div className="trip-activity-meta">
                              <span>⏱ {act.duration}</span>
                              <span>{act.priceMin === 0 && act.priceMax === 0 ? "Gratuito" : `€${act.priceMin}–€${act.priceMax}`}</span>
                              {act.cuisine && <span className="cuisine-tag">{act.cuisine}</span>}
                            </div>
                          </div>
                        </div>
                        <p className="trip-activity-desc">{act.description}</p>
                        {act.tip && <div className="trip-activity-tip"><span>💡</span><span>{act.tip}</span></div>}
                        <div className="trip-activity-actions">
                          <a href={googleMapsUrl(`${act.name} ${itin.destination}`)} target="_blank" rel="noopener noreferrer" className="trip-action-btn maps">📍 Mappa</a>
                          {isLoggedIn && isRest && <a href={openTableUrl(act.name, itin.destination, currentDay.date, size)} target="_blank" rel="noopener noreferrer" className="trip-action-btn book">🍽️ Prenota tavolo</a>}
                          {isLoggedIn && !isRest && act.bookingRequired && <a href={getYourGuideUrl(act.name, itin.destination)} target="_blank" rel="noopener noreferrer" className="trip-action-btn book">🎫 Prenota biglietto</a>}
                          {!isLoggedIn && act.bookingRequired && <Link href="/register" className="trip-action-btn book">🔒 Accedi per prenotare</Link>}
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

        {/* ═══ TRANSPORT ═══ */}
        {activeTab === "transport" && (
          isLocked("transport") ? <LoginGate tab="transport" /> : (
            <div className="trip-transport">
              <div className="trip-section-header">
                <h2 className="trip-section-title">Voli e trasporti</h2>
                <p className="trip-section-sub">Opzioni di viaggio da {trip.destination} a {itin.destination}.</p>
              </div>

              {transport?.outbound && (
                <div className="trip-transport-card">
                  <div className="trip-transport-header">
                    <div className="trip-transport-icon">{transport.outbound.type === "treno" ? "🚆" : "✈️"}</div>
                    <div>
                      <div className="trip-transport-route">{transport.outbound.from} → {transport.outbound.to}</div>
                      <div className="trip-transport-meta">{transport.outbound.type} · {transport.outbound.duration}</div>
                    </div>
                    <div className="trip-transport-price">
                      €{transport.outbound.estimatedPriceMin}–€{transport.outbound.estimatedPriceMax}
                      <div style={{ fontSize: ".72rem", color: "var(--muted)", fontWeight: 500 }}>p.p.</div>
                    </div>
                  </div>
                  {transport.outbound.operators?.length && (
                    <div className="trip-transport-operators">
                      {transport.outbound.operators.map(op => <span key={op} className="trip-operator-tag">{op}</span>)}
                    </div>
                  )}
                  {transport.outbound.tip && <div className="trip-activity-tip" style={{ margin: "0.75rem 0 0" }}><span>💡</span><span>{transport.outbound.tip}</span></div>}
                  <div className="trip-activity-actions" style={{ marginTop: "0.75rem" }}>
                    <a href={skyscannerUrl(transport.outbound.from, transport.outbound.to, trip.start_date, trip.travelers)} target="_blank" rel="noopener noreferrer" className="trip-action-btn book">✈️ Cerca voli andata</a>
                    {transport.outbound.type === "treno" && (
                      <a href={trenitaliUrl(transport.outbound.from, transport.outbound.to, trip.start_date)} target="_blank" rel="noopener noreferrer" className="trip-action-btn maps">🚆 Trenitalia</a>
                    )}
                  </div>
                </div>
              )}

              {transport?.return && (
                <div className="trip-transport-card" style={{ marginTop: "1rem" }}>
                  <div className="trip-transport-header">
                    <div className="trip-transport-icon">{transport.return.type === "treno" ? "🚆" : "✈️"}</div>
                    <div>
                      <div className="trip-transport-route">{transport.return.from} → {transport.return.to}</div>
                      <div className="trip-transport-meta">{transport.return.type} · {transport.return.duration}</div>
                    </div>
                    <div className="trip-transport-price">
                      €{transport.return.estimatedPriceMin}–€{transport.return.estimatedPriceMax}
                      <div style={{ fontSize: ".72rem", color: "var(--muted)", fontWeight: 500 }}>p.p.</div>
                    </div>
                  </div>
                  <div className="trip-activity-actions" style={{ marginTop: "0.75rem" }}>
                    <a href={skyscannerUrl(transport.return.from, transport.return.to, trip.end_date, trip.travelers)} target="_blank" rel="noopener noreferrer" className="trip-action-btn book">✈️ Cerca voli ritorno</a>
                  </div>
                </div>
              )}

              {transport?.local && (
                <div className="trip-hotel-note" style={{ marginTop: "1rem" }}>
                  <span>🚇</span><span><strong>Trasporti locali:</strong> {transport.local}</span>
                </div>
              )}

              {!transport && (
                <div className="trip-hotel-note">
                  <span>💡</span><span>Cerca i voli su Skyscanner per le migliori tariffe da {trip.destination} a {itin.destination}.</span>
                </div>
              )}
            </div>
          )
        )}

        {/* ═══ HOTELS ═══ */}
        {activeTab === "hotels" && (
          isLocked("hotels") ? <LoginGate tab="hotels" /> : (
            <div className="trip-hotels">
              <div className="trip-section-header">
                <h2 className="trip-section-title">Hotel selezionati dall&apos;AI</h2>
                <p className="trip-section-sub">Verificati e consigliati per il tuo profilo. Prenota direttamente.</p>
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
                    {hotel.highlights?.length && (
                      <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap", marginBottom: ".75rem" }}>
                        {hotel.highlights.map(h => (
                          <span key={h} style={{ background: "var(--sand)", borderRadius: "99px", padding: ".2rem .65rem", fontSize: ".72rem", color: "var(--muted)", fontWeight: 600 }}>{h}</span>
                        ))}
                      </div>
                    )}
                    <div className="trip-hotel-footer">
                      <div>
                        <div className="trip-hotel-price">da €{hotel.pricePerNight}</div>
                        <div className="trip-hotel-price-label">a notte</div>
                      </div>
                      <a href={bookingUrl(hotel.name + " " + itin.destination, trip.start_date, trip.end_date, trip.travelers)}
                        target="_blank" rel="noopener noreferrer"
                        className="trip-hotel-btn" style={{ textDecoration: "none", textAlign: "center" }}>
                        Verifica prezzi →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              <div className="trip-hotel-note">
                <span>💡</span><span>Prezzi e disponibilità aggiornati in tempo reale su Booking.com.</span>
              </div>
            </div>
          )
        )}

        {/* ═══ TIPS ═══ */}
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

        {/* ═══ BOOK ═══ */}
        {activeTab === "book" && (
          isLocked("book") ? <LoginGate tab="book" /> : (
            <div className="trip-book">
              <div className="trip-section-header">
                <h2 className="trip-section-title">Prenota il tuo viaggio</h2>
                <p className="trip-section-sub">Tutto in un posto. Prezzi reali, zero sorprese.</p>
              </div>

              <div className="trip-book-section">
                <div className="trip-book-section-title">✈️ Volo andata e ritorno</div>
                <div className="trip-book-card">
                  <div className="trip-book-card-info">
                    <div className="trip-book-card-name">Cerca i migliori voli</div>
                    <div className="trip-book-card-desc">{trip.destination} → {itin.destination} · {fmt(trip.start_date)} → {fmt(trip.end_date)}</div>
                    <div className="trip-book-card-price">
                      {transport?.outbound ? `da €${transport.outbound.estimatedPriceMin} p.p.` : "Prezzi variabili"}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
                    <a href={skyscannerUrl(trip.destination, itin.destination, trip.start_date, trip.travelers)} target="_blank" rel="noopener noreferrer" className="trip-book-btn">Cerca voli →</a>
                    <a href={trenitaliUrl(trip.destination, itin.destination, trip.start_date)} target="_blank" rel="noopener noreferrer" className="trip-book-btn" style={{ background: "var(--ink)", fontSize: ".8rem" }}>🚆 Treno →</a>
                  </div>
                </div>
              </div>

              <div className="trip-book-section">
                <div className="trip-book-section-title">🏨 Hotel</div>
                {itin.hotels.map((hotel, i) => (
                  <div key={i} className="trip-book-card">
                    <div className="trip-book-card-info">
                      <div className="trip-book-card-name">{hotel.name} <StarRating n={hotel.stars} /></div>
                      <div className="trip-book-card-desc">{hotel.zone} · {hotel.why}</div>
                      <div className="trip-book-card-price">da €{hotel.pricePerNight}/notte</div>
                    </div>
                    <a href={bookingUrl(hotel.name + " " + itin.destination, trip.start_date, trip.end_date, trip.travelers)} target="_blank" rel="noopener noreferrer" className="trip-book-btn">Prenota →</a>
                  </div>
                ))}
              </div>

              {allBookable.length > 0 && (
                <div className="trip-book-section">
                  <div className="trip-book-section-title">🎭 Esperienze</div>
                  {allBookable.slice(0, 4).map((act, i) => (
                    <div key={i} className="trip-book-card">
                      <div className="trip-book-card-info">
                        <div className="trip-book-card-name">{act.name}</div>
                        <div className="trip-book-card-desc">{act.tip}</div>
                        <div className="trip-book-card-price">€{act.priceMin}–€{act.priceMax} p.p.</div>
                      </div>
                      <a href={getYourGuideUrl(act.name, itin.destination)} target="_blank" rel="noopener noreferrer" className="trip-book-btn">Prenota →</a>
                    </div>
                  ))}
                </div>
              )}

              {allRestaurants.length > 0 && (
                <div className="trip-book-section">
                  <div className="trip-book-section-title">🍽️ Ristoranti</div>
                  {allRestaurants.slice(0, 4).map((act, i) => {
                    const dayIndex = itin.days.findIndex(d => d.activities.includes(act));
                    const date = itin.days[dayIndex >= 0 ? dayIndex : 0]?.date ?? trip.start_date;
                    return (
                      <div key={i} className="trip-book-card">
                        <div className="trip-book-card-info">
                          <div className="trip-book-card-name">{act.name}</div>
                          <div className="trip-book-card-desc">{act.cuisine && `${act.cuisine} · `}{act.tip}</div>
                          <div className="trip-book-card-price">€{act.priceMin}–€{act.priceMax} p.p.</div>
                        </div>
                        <a href={openTableUrl(act.name, itin.destination, date, size)} target="_blank" rel="noopener noreferrer" className="trip-book-btn">Prenota →</a>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="trip-hotel-note">
                <span>🤝</span><span>ROAMIQ riceve una piccola commissione per ogni prenotazione. Per te il prezzo è sempre lo stesso.</span>
              </div>
            </div>
          )
        )}

        {!isLoggedIn && (
          <div className="trip-register-banner">
            <div className="trip-register-banner-content">
              <div>
                <div className="trip-register-banner-title">💾 Salva questo itinerario</div>
                <div className="trip-register-banner-sub">Registrati gratis per salvarlo, vedere hotel, voli e prenotare tutto.</div>
              </div>
              <Link href="/register" className="trip-register-banner-btn">Registrati gratis →</Link>
            </div>
          </div>
        )}
      </main>

      <div className="trip-sticky-bar">
        <div className="trip-sticky-info">
          <span className="trip-sticky-dest">{itin.emoji} {itin.destination} · {totalDays} giorni</span>
          <span className="trip-sticky-cost">€{itin.totalCostMin}–{itin.totalCostMax} p.p.</span>
        </div>
        <div className="trip-sticky-actions">
          <Link href="/onboarding" className="trip-sticky-btn ghost">↩ Ricrea</Link>
          <button className="trip-sticky-btn primary" onClick={() => setActiveTab("book")}>
            {isLoggedIn ? "Prenota tutto →" : "🔒 Prenota"}
          </button>
        </div>
      </div>
    </div>
  );
}
