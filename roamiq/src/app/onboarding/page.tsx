"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type TripData = {
  destination: string;
  departureCity: string;
  startDate: string;
  endDate: string;
  travelers: "solo" | "coppia" | "amici" | "famiglia" | "";
  budget: "low" | "mid" | "high" | "luxury" | "";
  interests: string[];
  pace: "lento" | "equilibrato" | "intenso" | "";
  cuisines: string[];
  dietaryNeeds: string[];
  diningBudget: "street" | "casual" | "restaurant" | "fine" | "";
  mode: "know" | "surprise" | "";
};

const INITIAL: TripData = {
  destination: "", departureCity: "", startDate: "", endDate: "",
  travelers: "", budget: "", interests: [], pace: "",
  cuisines: [], dietaryNeeds: [], diningBudget: "", mode: "",
};

const INTERESTS = [
  { id: "arte",      label: "Arte & Musei",      icon: "🎨" },
  { id: "food",      label: "Food & Vino",        icon: "🍷" },
  { id: "natura",    label: "Natura & Trekking",  icon: "🌿" },
  { id: "storia",    label: "Storia & Cultura",   icon: "🏛️" },
  { id: "nightlife", label: "Nightlife",           icon: "🎶" },
  { id: "shopping",  label: "Shopping",            icon: "🛍️" },
  { id: "sport",     label: "Sport & Avventura",  icon: "⚡" },
  { id: "relax",     label: "Relax & Spa",         icon: "🧘" },
  { id: "foto",      label: "Fotografia",          icon: "📸" },
  { id: "locals",    label: "Vita da local",       icon: "🏘️" },
];

const CUISINES = [
  { id: "locale",       label: "Cucina locale",     icon: "🍽️" },
  { id: "italiana",     label: "Italiana",          icon: "🍝" },
  { id: "asiatica",     label: "Asiatica",          icon: "🍜" },
  { id: "mediterranea", label: "Mediterranea",      icon: "🥗" },
  { id: "street-food",  label: "Street food",       icon: "🌮" },
  { id: "pesce",        label: "Pesce & mare",      icon: "🐟" },
  { id: "carne",        label: "Carne & grigliate", icon: "🥩" },
  { id: "vegetariana",  label: "Vegetariana",       icon: "🥦" },
];

const DIETARY = [
  { id: "nessuna",       label: "Nessuna", icon: "✅" },
  { id: "vegetariano",   label: "Vegetariano", icon: "🥗" },
  { id: "vegano",        label: "Vegano", icon: "🌱" },
  { id: "senza-glutine", label: "Senza glutine", icon: "🌾" },
  { id: "halal",         label: "Halal", icon: "☪️" },
];

interface Suggestion {
  city: string; country: string; emoji: string;
  tagline: string; why: string; highlights: string[];
  estimatedCostMin: number; estimatedCostMax: number; flightTime: string;
}

const TOTAL_STEPS = 7;

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="ob-progress">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div key={i} className={`ob-progress-dot ${i + 1 < step ? "done" : i + 1 === step ? "active" : ""}`} />
      ))}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="ob-card">{children}</div>;
}

function NavButtons({ step, onBack, onNext, canNext, loading, lastStep }: {
  step: number; onBack: () => void; onNext: () => void;
  canNext: boolean; loading?: boolean; lastStep?: boolean;
}) {
  return (
    <div className="ob-nav">
      {step > 1 && <button className="ob-btn-back" onClick={onBack}>← Indietro</button>}
      <button
        className={`ob-btn-next ${!canNext ? "disabled" : ""} ${lastStep ? "cta" : ""}`}
        onClick={onNext} disabled={!canNext || loading}
      >
        {loading ? <span className="ob-spinner" /> : lastStep ? "✨ Genera il mio itinerario" : "Avanti →"}
      </button>
    </div>
  );
}

/* ── STEP 1: Modalità ── */
function Step1({ data, onChange }: { data: TripData; onChange: (v: Partial<TripData>) => void }) {
  return (
    <Card>
      <div className="ob-icon">✈️</div>
      <h2 className="ob-title">Come vuoi viaggiare?</h2>
      <p className="ob-sub">Sai già dove vuoi andare, o vuoi che l&apos;AI ti sorprenda?</p>
      <div className="ob-options-grid">
        <button
          className={`ob-option-card ${data.mode === "know" ? "selected" : ""}`}
          onClick={() => onChange({ mode: "know" })}
        >
          <span className="ob-option-icon">🗺️</span>
          <span className="ob-option-label">So dove voglio andare</span>
          <span className="ob-option-desc">Scelgo io la destinazione</span>
        </button>
        <button
          className={`ob-option-card ${data.mode === "surprise" ? "selected" : ""}`}
          onClick={() => onChange({ mode: "surprise" })}
        >
          <span className="ob-option-icon">🎲</span>
          <span className="ob-option-label">Sorprendimi!</span>
          <span className="ob-option-desc">L&apos;AI sceglie le 5 migliori mete per me</span>
        </button>
      </div>
    </Card>
  );
}

/* ── STEP 2: Destinazione o Solo date ── */
function Step2({ data, onChange }: { data: TripData; onChange: (v: Partial<TripData>) => void }) {
  const popular = ["Roma", "Barcellona", "Parigi", "Lisbona", "Amsterdam", "Vienna", "Praga", "Berlino"];
  const days = data.startDate && data.endDate
    ? Math.ceil((new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / 86400000)
    : null;

  return (
    <Card>
      <div className="ob-icon">{data.mode === "surprise" ? "📅" : "🌍"}</div>
      <h2 className="ob-title">{data.mode === "surprise" ? "Da dove parti e quando?" : "Dove e quando?"}</h2>
      <p className="ob-sub">
        {data.mode === "surprise"
          ? "Inserisci la città di partenza e le date — l'AI troverà le destinazioni perfette."
          : "Scrivi la destinazione, la città di partenza e le date."}
      </p>

      {data.mode === "know" && (
        <>
          <label className="ob-label">Destinazione</label>
          <input className="ob-input" type="text" placeholder="Es. Barcellona, Tokyo, New York..."
            value={data.destination} onChange={(e) => onChange({ destination: e.target.value })} autoFocus />
          <div className="ob-chips" style={{ marginBottom: "1.2rem" }}>
            {popular.map((city) => (
              <button key={city} className={`ob-chip ${data.destination === city ? "selected" : ""}`}
                onClick={() => onChange({ destination: city })}>{city}</button>
            ))}
          </div>
        </>
      )}

      <label className="ob-label">Città di partenza</label>
      <input className="ob-input" type="text" placeholder="Es. Milano, Roma, Torino..."
        value={data.departureCity} onChange={(e) => onChange({ departureCity: e.target.value })} />

      <div className="ob-date-grid">
        <div className="ob-date-field">
          <label className="ob-label">Partenza</label>
          <input className="ob-input" type="date" value={data.startDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => onChange({ startDate: e.target.value })} />
        </div>
        <div className="ob-date-field">
          <label className="ob-label">Ritorno</label>
          <input className="ob-input" type="date" value={data.endDate}
            min={data.startDate || new Date().toISOString().split("T")[0]}
            onChange={(e) => onChange({ endDate: e.target.value })} />
        </div>
      </div>

      {days && days > 0 && (
        <div className="ob-duration-badge">
          ✈️ {days} giorni {data.mode === "know" && data.destination ? `· ${data.departureCity} → ${data.destination}` : `da ${data.departureCity}`}
        </div>
      )}
    </Card>
  );
}

/* ── STEP 3: Chi viaggia ── */
function Step3({ data, onChange }: { data: TripData; onChange: (v: Partial<TripData>) => void }) {
  const options = [
    { id: "solo",     label: "Solo",     icon: "🧍", desc: "Il mio ritmo, le mie regole" },
    { id: "coppia",   label: "Coppia",   icon: "👫", desc: "Romantico e su misura" },
    { id: "amici",    label: "Amici",    icon: "👯", desc: "Divertimento e scoperta" },
    { id: "famiglia", label: "Famiglia", icon: "👨‍👩‍👧‍👦", desc: "Per grandi e piccoli" },
  ] as const;
  return (
    <Card>
      <div className="ob-icon">👥</div>
      <h2 className="ob-title">Con chi viaggi?</h2>
      <p className="ob-sub">L&apos;AI adatta l&apos;itinerario al tuo gruppo.</p>
      <div className="ob-options-grid">
        {options.map((opt) => (
          <button key={opt.id} className={`ob-option-card ${data.travelers === opt.id ? "selected" : ""}`}
            onClick={() => onChange({ travelers: opt.id })}>
            <span className="ob-option-icon">{opt.icon}</span>
            <span className="ob-option-label">{opt.label}</span>
            <span className="ob-option-desc">{opt.desc}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}

/* ── STEP 4: Budget ── */
function Step4({ data, onChange }: { data: TripData; onChange: (v: Partial<TripData>) => void }) {
  const options = [
    { id: "low",    label: "Economico", icon: "💚", range: "< €80/giorno",    desc: "Ostelli, street food" },
    { id: "mid",    label: "Medio",     icon: "💛", range: "€80–200/giorno",  desc: "Hotel 3★, ristoranti locali" },
    { id: "high",   label: "Comfort",   icon: "🧡", range: "€200–400/giorno", desc: "Hotel 4★, esperienze premium" },
    { id: "luxury", label: "Lusso",     icon: "💜", range: "> €400/giorno",   desc: "Suite, private tour" },
  ] as const;
  return (
    <Card>
      <div className="ob-icon">💰</div>
      <h2 className="ob-title">Qual è il tuo budget?</h2>
      <p className="ob-sub">Ti costruiamo un viaggio nei tuoi parametri reali.</p>
      <div className="ob-budget-grid">
        {options.map((opt) => (
          <button key={opt.id} className={`ob-budget-card ${data.budget === opt.id ? "selected" : ""}`}
            onClick={() => onChange({ budget: opt.id })}>
            <span className="ob-budget-icon">{opt.icon}</span>
            <span className="ob-budget-label">{opt.label}</span>
            <span className="ob-budget-range">{opt.range}</span>
            <span className="ob-budget-desc">{opt.desc}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}

/* ── STEP 5: Interessi ── */
function Step5({ data, onChange }: { data: TripData; onChange: (v: Partial<TripData>) => void }) {
  const toggle = (id: string) => {
    const next = data.interests.includes(id)
      ? data.interests.filter((i) => i !== id) : [...data.interests, id];
    onChange({ interests: next });
  };
  return (
    <Card>
      <div className="ob-icon">✨</div>
      <h2 className="ob-title">Cosa ami fare?</h2>
      <p className="ob-sub">Scegli almeno 2 interessi — inclusa la vita da local!</p>
      <div className="ob-interests-grid">
        {INTERESTS.map((int) => (
          <button key={int.id} className={`ob-interest-btn ${data.interests.includes(int.id) ? "selected" : ""}`}
            onClick={() => toggle(int.id)}>
            <span>{int.icon}</span><span>{int.label}</span>
          </button>
        ))}
      </div>
      {data.interests.length > 0 && <p className="ob-counter">{data.interests.length} selezionati</p>}
    </Card>
  );
}

/* ── STEP 6: Food ── */
function Step6({ data, onChange }: { data: TripData; onChange: (v: Partial<TripData>) => void }) {
  const toggleCuisine = (id: string) => {
    const next = data.cuisines.includes(id)
      ? data.cuisines.filter((c) => c !== id) : [...data.cuisines, id];
    onChange({ cuisines: next });
  };
  const diningOptions = [
    { id: "street",     label: "Street food",  icon: "🌮", desc: "Mercati, kiosk, economico" },
    { id: "casual",     label: "Casual",       icon: "🍕", desc: "Trattorie e bistrot locali" },
    { id: "restaurant", label: "Ristorante",   icon: "🍽️", desc: "Cucina curata, ambientazione" },
    { id: "fine",       label: "Fine dining",  icon: "🥂", desc: "Alta cucina, esperienze top" },
  ] as const;

  return (
    <Card>
      <div className="ob-icon">🍷</div>
      <h2 className="ob-title">Come mangi in viaggio?</h2>
      <p className="ob-sub">Ti cerco i posti giusti per te — solo reali e verificati.</p>
      <label className="ob-label" style={{ marginBottom: "0.75rem", display: "block" }}>Cucina preferita</label>
      <div className="ob-interests-grid" style={{ marginBottom: "1.5rem" }}>
        {CUISINES.map((c) => (
          <button key={c.id} className={`ob-interest-btn ${data.cuisines.includes(c.id) ? "selected" : ""}`}
            onClick={() => toggleCuisine(c.id)}>
            <span>{c.icon}</span><span>{c.label}</span>
          </button>
        ))}
      </div>
      <label className="ob-label" style={{ marginBottom: "0.75rem", display: "block" }}>Tipo di ristorazione</label>
      <div className="ob-budget-grid">
        {diningOptions.map((opt) => (
          <button key={opt.id} className={`ob-budget-card ${data.diningBudget === opt.id ? "selected" : ""}`}
            onClick={() => onChange({ diningBudget: opt.id })}>
            <span className="ob-budget-icon">{opt.icon}</span>
            <span className="ob-budget-label">{opt.label}</span>
            <span className="ob-budget-desc">{opt.desc}</span>
          </button>
        ))}
      </div>
      <label className="ob-label" style={{ margin: "1.2rem 0 0.75rem", display: "block" }}>Esigenze alimentari</label>
      <div className="ob-chips">
        {DIETARY.map((d) => (
          <button key={d.id}
            className={`ob-chip ${data.dietaryNeeds.includes(d.id) ? "selected" : ""}`}
            onClick={() => {
              if (d.id === "nessuna") { onChange({ dietaryNeeds: [] }); return; }
              const next = data.dietaryNeeds.includes(d.id)
                ? data.dietaryNeeds.filter((x) => x !== d.id)
                : [...data.dietaryNeeds.filter((x) => x !== "nessuna"), d.id];
              onChange({ dietaryNeeds: next });
            }}>
            {d.icon} {d.label}
          </button>
        ))}
      </div>
    </Card>
  );
}

/* ── STEP 7: Ritmo + riepilogo ── */
function Step7({ data, onChange }: { data: TripData; onChange: (v: Partial<TripData>) => void }) {
  const options = [
    { id: "lento",       label: "Rilassato",  icon: "🌅", desc: "3 attività/giorno, tanto tempo libero." },
    { id: "equilibrato", label: "Equilibrato", icon: "⚖️", desc: "4-5 attività. Mix perfetto tra scoperta e relax." },
    { id: "intenso",     label: "Intenso",     icon: "🚀", desc: "5+ attività. Ogni momento sfruttato al massimo." },
  ] as const;
  const days = data.startDate && data.endDate
    ? Math.ceil((new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / 86400000)
    : null;
  return (
    <Card>
      <div className="ob-icon">⚡</div>
      <h2 className="ob-title">Che ritmo preferisci?</h2>
      <p className="ob-sub">L&apos;AI calibra la densità dell&apos;itinerario sul tuo stile.</p>
      <div className="ob-pace-grid">
        {options.map((opt) => (
          <button key={opt.id} className={`ob-pace-card ${data.pace === opt.id ? "selected" : ""}`}
            onClick={() => onChange({ pace: opt.id })}>
            <span className="ob-pace-icon">{opt.icon}</span>
            <span className="ob-pace-label">{opt.label}</span>
            <p className="ob-pace-desc">{opt.desc}</p>
          </button>
        ))}
      </div>
      <div className="ob-summary">
        <div className="ob-summary-title">Il tuo riepilogo</div>
        <div className="ob-summary-grid">
          <div className="ob-summary-item"><span className="ob-summary-icon">🛫</span><span>{data.departureCity || "—"}</span></div>
          <div className="ob-summary-item"><span className="ob-summary-icon">📍</span><span>{data.destination || "Sorpresa AI"}</span></div>
          <div className="ob-summary-item"><span className="ob-summary-icon">📅</span><span>{days ? `${days} giorni` : "—"}</span></div>
          <div className="ob-summary-item"><span className="ob-summary-icon">👥</span><span className="capitalize">{data.travelers || "—"}</span></div>
          <div className="ob-summary-item"><span className="ob-summary-icon">💰</span><span className="capitalize">{data.budget || "—"}</span></div>
          <div className="ob-summary-item"><span className="ob-summary-icon">🍽️</span><span className="capitalize">{data.diningBudget || "—"}</span></div>
        </div>
      </div>
    </Card>
  );
}

/* ── DESTINATION PICKER (modalità Sorprendimi) ── */
function DestinationPicker({
  suggestions, onSelect, loading
}: {
  suggestions: Suggestion[]; onSelect: (city: string) => void; loading: boolean;
}) {
  if (loading) {
    return (
      <div className="ob-card" style={{ textAlign: "center", padding: "3rem" }}>
        <div className="ob-gen-spinner" style={{ margin: "0 auto 1.5rem" }}>
          <div className="ob-gen-ring" />
          <div className="ob-gen-emoji">🌍</div>
        </div>
        <h3 style={{ fontFamily: "var(--font-display)", color: "var(--ink)", marginBottom: ".5rem" }}>
          L&apos;AI sta scegliendo le destinazioni perfette per te...
        </h3>
        <p style={{ color: "var(--muted)", fontSize: ".9rem" }}>Analisi stagione, budget e preferenze</p>
      </div>
    );
  }

  return (
    <div>
      <div className="ob-icon">🌟</div>
      <h2 className="ob-title">Le 5 mete perfette per te</h2>
      <p className="ob-sub">Seleziona quella che ti ispira di più.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {suggestions.map((s) => (
          <button
            key={s.city}
            onClick={() => onSelect(s.city)}
            style={{
              background: "var(--white)", border: "1.5px solid var(--border2)",
              borderRadius: "16px", padding: "1.2rem 1.4rem",
              textAlign: "left", cursor: "pointer", transition: "all .2s",
              display: "flex", gap: "1rem", alignItems: "flex-start",
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--clay)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border2)")}
          >
            <div style={{ fontSize: "2rem", flexShrink: 0 }}>{s.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: ".75rem", marginBottom: ".3rem" }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.05rem", color: "var(--ink)" }}>
                  {s.city}
                </span>
                <span style={{ fontSize: ".75rem", color: "var(--muted)" }}>{s.country}</span>
                <span style={{ fontSize: ".72rem", color: "var(--clay)", fontWeight: 600, marginLeft: "auto" }}>
                  ✈️ {s.flightTime}
                </span>
              </div>
              <div style={{ fontStyle: "italic", color: "var(--clay)", fontSize: ".85rem", marginBottom: ".4rem" }}>
                &ldquo;{s.tagline}&rdquo;
              </div>
              <div style={{ fontSize: ".82rem", color: "var(--muted)", marginBottom: ".6rem", lineHeight: 1.5 }}>
                {s.why}
              </div>
              <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap" }}>
                {s.highlights.map((h) => (
                  <span key={h} style={{
                    background: "var(--sand)", borderRadius: "99px",
                    padding: ".2rem .65rem", fontSize: ".72rem", color: "var(--muted)", fontWeight: 600,
                  }}>{h}</span>
                ))}
              </div>
              <div style={{ marginTop: ".6rem", fontSize: ".78rem", color: "var(--clay)", fontWeight: 700 }}>
                ~€{s.estimatedCostMin}–€{s.estimatedCostMax} p.p.
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── GENERATING SCREEN ── */
function GeneratingScreen({ destination }: { destination: string }) {
  const [current, setCurrent] = useState(0);
  const steps = [
    "Analisi delle tue preferenze...",
    `Ricerca ristoranti verificati a ${destination}...`,
    "Verifica attrazioni e locali notturni...",
    "Costruzione dell'itinerario giornaliero...",
    "Calcolo dei costi reali...",
    "Finalizzazione del tuo viaggio...",
  ];
  useState(() => {
    const timers = steps.map((_, i) => setTimeout(() => setCurrent(i), i * 8000));
    return () => timers.forEach(clearTimeout);
  });
  return (
    <div className="ob-generating">
      <div className="ob-gen-logo">ROAM<span>IQ</span></div>
      <div className="ob-gen-spinner">
        <div className="ob-gen-ring" />
        <div className="ob-gen-emoji">✨</div>
      </div>
      <h2 className="ob-gen-title">Sto creando il tuo viaggio perfetto</h2>
      <p className="ob-gen-sub">L&apos;AI sta verificando ristoranti e posti reali...</p>
      <div className="ob-gen-steps">
        {steps.map((s, i) => (
          <div key={i} className={`ob-gen-step ${i <= current ? "active" : ""}`}>
            <span className="ob-gen-check">{i < current ? "✓" : i === current ? "→" : "○"}</span>
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── MAIN ── */
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<TripData>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const update = (v: Partial<TripData>) => setData((d) => ({ ...d, ...v }));

  const canNext = (): boolean => {
    switch (step) {
      case 1: return !!data.mode;
      case 2:
        if (data.mode === "surprise") return !!data.departureCity.trim() && !!data.startDate && !!data.endDate && data.endDate > data.startDate;
        return !!data.destination.trim() && !!data.departureCity.trim() && !!data.startDate && !!data.endDate && data.endDate > data.startDate;
      case 3: return !!data.travelers;
      case 4: return !!data.budget;
      case 5: return data.interests.length >= 2;
      case 6: return !!data.diningBudget;
      case 7: return !!data.pace;
      default: return false;
    }
  };

  const fetchSuggestions = async () => {
    setLoadingSuggestions(true);
    setShowPicker(true);
    try {
      const res = await fetch("/api/suggest-destinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departureCity: data.departureCity,
          startDate: data.startDate,
          endDate: data.endDate,
          travelers: data.travelers,
          budget: data.budget,
        }),
      });
      const text = await res.text();
      const json = JSON.parse(text.trim());
      if (json.suggestions) setSuggestions(json.suggestions);
    } catch { /* ignora */ }
    setLoadingSuggestions(false);
  };

  const handleNext = async () => {
    // Modalità sorpresa: dopo step 4 (budget), mostra picker
    if (data.mode === "surprise" && step === 4 && !data.destination) {
      await fetchSuggestions();
      return;
    }

    if (step < TOTAL_STEPS) { setStep((s) => s + 1); return; }

    setGenerating(true);
    setLoading(true);
    try {
      const res = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const text = await res.text();
      let json;
      try { json = JSON.parse(text.trim()); }
      catch { throw new Error("Risposta non valida. Riprova."); }
      if (json.error) throw new Error(json.error);
      const tripId = json.tripId ?? "demo";
      sessionStorage.setItem("roamiq_last_trip", JSON.stringify({
        id: tripId, itinerary: json.itinerary,
        destination: data.destination, start_date: data.startDate,
        end_date: data.endDate, travelers: data.travelers, budget: data.budget,
      }));
      router.push(`/trip/${tripId}`);
    } catch (err) {
      setGenerating(false);
      setLoading(false);
      alert("Errore: " + (err instanceof Error ? err.message : "Riprova tra poco"));
    }
  };

  if (generating) return <GeneratingScreen destination={data.destination} />;

  // Picker destinazioni sorpresa
  if (showPicker) {
    return (
      <div className="ob-page">
        <header className="ob-header">
          <Link href="/" className="ob-logo">ROAM<span>IQ</span></Link>
          <ProgressBar step={4} />
          <div className="ob-step-counter">4/{TOTAL_STEPS}</div>
        </header>
        <div className="ob-container">
          <DestinationPicker
            suggestions={suggestions}
            loading={loadingSuggestions}
            onSelect={(city) => {
              update({ destination: city });
              setShowPicker(false);
              setStep(5);
            }}
          />
          {!loadingSuggestions && (
            <div className="ob-nav" style={{ marginTop: "1.5rem" }}>
              <button className="ob-btn-back" onClick={() => setShowPicker(false)}>← Indietro</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="ob-page">
      <header className="ob-header">
        <Link href="/" className="ob-logo">ROAM<span>IQ</span></Link>
        <ProgressBar step={step} />
        <div className="ob-step-counter">{step}/{TOTAL_STEPS}</div>
      </header>
      <div className="ob-container">
        <div className="ob-step-label">Step {step} di {TOTAL_STEPS}</div>
        <div className="ob-step-wrap">
          {step === 1 && <Step1 data={data} onChange={update} />}
          {step === 2 && <Step2 data={data} onChange={update} />}
          {step === 3 && <Step3 data={data} onChange={update} />}
          {step === 4 && <Step4 data={data} onChange={update} />}
          {step === 5 && <Step5 data={data} onChange={update} />}
          {step === 6 && <Step6 data={data} onChange={update} />}
          {step === 7 && <Step7 data={data} onChange={update} />}
        </div>
        <NavButtons step={step} onBack={() => setStep((s) => s - 1)}
          onNext={handleNext} canNext={canNext()} loading={loading} lastStep={step === TOTAL_STEPS} />
      </div>
    </div>
  );
}
