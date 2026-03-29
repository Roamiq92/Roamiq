"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/* ─── TYPES ─────────────────────────────────────────────── */
type TripData = {
  destination: string;
  departureCity: string;
  startDate: string;
  endDate: string;
  travelers: "solo" | "coppia" | "amici" | "famiglia" | "";
  budget: "low" | "mid" | "high" | "luxury" | "";
  interests: string[];
  pace: "lento" | "equilibrato" | "intenso" | "";
};

const INITIAL: TripData = {
  destination: "",
  departureCity: "",
  startDate: "",
  endDate: "",
  travelers: "",
  budget: "",
  interests: [],
  pace: "",
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
];

const TOTAL_STEPS = 6;

/* ─── HELPERS ───────────────────────────────────────────── */
function ProgressBar({ step }: { step: number }) {
  return (
    <div className="ob-progress">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className={`ob-progress-dot ${
            i + 1 < step ? "done" : i + 1 === step ? "active" : ""
          }`}
        />
      ))}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="ob-card">{children}</div>;
}

function StepLabel({ step }: { step: number }) {
  return (
    <div className="ob-step-label">
      Step {step} di {TOTAL_STEPS}
    </div>
  );
}

function NavButtons({
  step, onBack, onNext, canNext, loading, lastStep,
}: {
  step: number; onBack: () => void; onNext: () => void;
  canNext: boolean; loading?: boolean; lastStep?: boolean;
}) {
  return (
    <div className="ob-nav">
      {step > 1 && (
        <button className="ob-btn-back" onClick={onBack}>← Indietro</button>
      )}
      <button
        className={`ob-btn-next ${!canNext ? "disabled" : ""} ${lastStep ? "cta" : ""}`}
        onClick={onNext}
        disabled={!canNext || loading}
      >
        {loading ? <span className="ob-spinner" /> : lastStep ? "✨ Genera il mio itinerario" : "Avanti →"}
      </button>
    </div>
  );
}

/* ─── STEPS ──────────────────────────────────────────────── */
function Step1({ data, onChange }: { data: TripData; onChange: (v: Partial<TripData>) => void }) {
  const popular = ["Roma", "Barcellona", "Parigi", "Lisbona", "Amsterdam", "Vienna", "Praga", "Berlino"];
  return (
    <Card>
      <div className="ob-icon">🌍</div>
      <h2 className="ob-title">Dove vuoi andare?</h2>
      <p className="ob-sub">Scrivi una città o scegli tra quelle più popolari.</p>
      <input
        className="ob-input" type="text"
        placeholder="Es. Barcellona, Tokyo, New York..."
        value={data.destination}
        onChange={(e) => onChange({ destination: e.target.value })}
        autoFocus
      />
      <div className="ob-chips">
        {popular.map((city) => (
          <button
            key={city}
            className={`ob-chip ${data.destination === city ? "selected" : ""}`}
            onClick={() => onChange({ destination: city })}
          >{city}</button>
        ))}
      </div>
    </Card>
  );
}

function Step2({ data, onChange }: { data: TripData; onChange: (v: Partial<TripData>) => void }) {
  const days = data.startDate && data.endDate
    ? Math.ceil((new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / 86400000)
    : null;

  return (
    <Card>
      <div className="ob-icon">📅</div>
      <h2 className="ob-title">Quando e da dove?</h2>
      <p className="ob-sub">Città di partenza e date del viaggio.</p>
      <label className="ob-label">Città di partenza</label>
      <input
        className="ob-input" type="text"
        placeholder="Es. Milano, Roma, Torino..."
        value={data.departureCity}
        onChange={(e) => onChange({ departureCity: e.target.value })}
      />
      <div className="ob-date-grid">
        <div className="ob-date-field">
          <label className="ob-label">Data di partenza</label>
          <input
            className="ob-input" type="date"
            value={data.startDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => onChange({ startDate: e.target.value })}
          />
        </div>
        <div className="ob-date-field">
          <label className="ob-label">Data di ritorno</label>
          <input
            className="ob-input" type="date"
            value={data.endDate}
            min={data.startDate || new Date().toISOString().split("T")[0]}
            onChange={(e) => onChange({ endDate: e.target.value })}
          />
        </div>
      </div>
      {days && days > 0 && (
        <div className="ob-duration-badge">
          ✈️ {days} giorni · {data.departureCity} → {data.destination}
        </div>
      )}
    </Card>
  );
}

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
          <button
            key={opt.id}
            className={`ob-option-card ${data.travelers === opt.id ? "selected" : ""}`}
            onClick={() => onChange({ travelers: opt.id })}
          >
            <span className="ob-option-icon">{opt.icon}</span>
            <span className="ob-option-label">{opt.label}</span>
            <span className="ob-option-desc">{opt.desc}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}

function Step4({ data, onChange }: { data: TripData; onChange: (v: Partial<TripData>) => void }) {
  const options = [
    { id: "low",    label: "Economico", icon: "💚", range: "< €80/giorno",    desc: "Ostelli, street food, gratis" },
    { id: "mid",    label: "Medio",     icon: "💛", range: "€80–200/giorno",  desc: "Hotel 3★, ristoranti locali" },
    { id: "high",   label: "Comfort",   icon: "🧡", range: "€200–400/giorno", desc: "Hotel 4★, esperienze premium" },
    { id: "luxury", label: "Lusso",     icon: "💜", range: "> €400/giorno",   desc: "Suite, private tour, fine dining" },
  ] as const;
  return (
    <Card>
      <div className="ob-icon">💰</div>
      <h2 className="ob-title">Qual è il tuo budget?</h2>
      <p className="ob-sub">Ti costruiamo un viaggio nei tuoi parametri reali.</p>
      <div className="ob-budget-grid">
        {options.map((opt) => (
          <button
            key={opt.id}
            className={`ob-budget-card ${data.budget === opt.id ? "selected" : ""}`}
            onClick={() => onChange({ budget: opt.id })}
          >
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

function Step5({ data, onChange }: { data: TripData; onChange: (v: Partial<TripData>) => void }) {
  const toggle = (id: string) => {
    const next = data.interests.includes(id)
      ? data.interests.filter((i) => i !== id)
      : [...data.interests, id];
    onChange({ interests: next });
  };
  return (
    <Card>
      <div className="ob-icon">✨</div>
      <h2 className="ob-title">Cosa ami fare?</h2>
      <p className="ob-sub">Scegli almeno 2 interessi. Più scegli, meglio ti conosco.</p>
      <div className="ob-interests-grid">
        {INTERESTS.map((int) => (
          <button
            key={int.id}
            className={`ob-interest-btn ${data.interests.includes(int.id) ? "selected" : ""}`}
            onClick={() => toggle(int.id)}
          >
            <span>{int.icon}</span>
            <span>{int.label}</span>
          </button>
        ))}
      </div>
      {data.interests.length > 0 && (
        <p className="ob-counter">{data.interests.length} selezionati</p>
      )}
    </Card>
  );
}

function Step6({ data, onChange }: { data: TripData; onChange: (v: Partial<TripData>) => void }) {
  const options = [
    { id: "lento",       label: "Rilassato",  icon: "🌅", desc: "2–3 attività al giorno. Tanto tempo libero." },
    { id: "equilibrato", label: "Equilibrato", icon: "⚖️", desc: "3–5 attività al giorno. Mix perfetto." },
    { id: "intenso",     label: "Intenso",     icon: "🚀", desc: "5+ attività al giorno. Ogni minuto sfruttato." },
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
          <button
            key={opt.id}
            className={`ob-pace-card ${data.pace === opt.id ? "selected" : ""}`}
            onClick={() => onChange({ pace: opt.id })}
          >
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
          <div className="ob-summary-item"><span className="ob-summary-icon">📍</span><span>{data.destination || "—"}</span></div>
          <div className="ob-summary-item"><span className="ob-summary-icon">📅</span><span>{days ? `${days} giorni` : "—"}</span></div>
          <div className="ob-summary-item"><span className="ob-summary-icon">👥</span><span className="capitalize">{data.travelers || "—"}</span></div>
          <div className="ob-summary-item"><span className="ob-summary-icon">💰</span><span className="capitalize">{data.budget || "—"}</span></div>
          <div className="ob-summary-item"><span className="ob-summary-icon">🎯</span><span>{data.interests.length} interessi</span></div>
        </div>
      </div>
    </Card>
  );
}

/* ─── GENERATING SCREEN ──────────────────────────────────── */
function GeneratingScreen({ destination }: { destination: string }) {
  const [current, setCurrent] = useState(0);

  const steps = [
    "Analisi delle tue preferenze...",
    `Ricerca delle migliori esperienze a ${destination}...`,
    "Costruzione dell'itinerario giornaliero...",
    "Calcolo dei costi e disponibilità...",
    "Finalizzazione del tuo viaggio su misura...",
  ];

  // Avanza gli step ogni ~8 secondi (totale ~40s che è dentro il timeout di 60s)
  useEffect(() => {
    const timers = steps.map((_, i) =>
      setTimeout(() => setCurrent(i), i * 8000)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="ob-generating">
      <div className="ob-gen-logo">ROAM<span>IQ</span></div>
      <div className="ob-gen-spinner">
        <div className="ob-gen-ring" />
        <div className="ob-gen-emoji">✨</div>
      </div>
      <h2 className="ob-gen-title">Sto creando il tuo viaggio perfetto</h2>
      <p className="ob-gen-sub">L&apos;AI sta lavorando per te...</p>
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

/* ─── MAIN PAGE ──────────────────────────────────────────── */
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<TripData>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const update = (v: Partial<TripData>) => setData((d) => ({ ...d, ...v }));

  const canNext = (): boolean => {
    switch (step) {
      case 1: return data.destination.trim().length >= 2;
      case 2: return !!data.departureCity.trim() && !!data.startDate && !!data.endDate && data.endDate > data.startDate;
      case 3: return !!data.travelers;
      case 4: return !!data.budget;
      case 5: return data.interests.length >= 2;
      case 6: return !!data.pace;
      default: return false;
    }
  };

  const handleNext = async () => {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      return;
    }
    setGenerating(true);
    setLoading(true);
    try {
      const res = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Errore API");
      }

      const tripId = json.tripId ?? "demo";
      router.push(`/trip/${tripId}`);
    } catch (err) {
      console.error(err);
      setGenerating(false);
      setLoading(false);
      alert("Qualcosa è andato storto. Controlla la connessione e riprova.");
    }
  };

  if (generating) {
    return <GeneratingScreen destination={data.destination} />;
  }

  return (
    <div className="ob-page">
      <header className="ob-header">
        <Link href="/" className="ob-logo">ROAM<span>IQ</span></Link>
        <ProgressBar step={step} />
        <div className="ob-step-counter">{step}/{TOTAL_STEPS}</div>
      </header>
      <div className="ob-container">
        <StepLabel step={step} />
        <div className="ob-step-wrap">
          {step === 1 && <Step1 data={data} onChange={update} />}
          {step === 2 && <Step2 data={data} onChange={update} />}
          {step === 3 && <Step3 data={data} onChange={update} />}
          {step === 4 && <Step4 data={data} onChange={update} />}
          {step === 5 && <Step5 data={data} onChange={update} />}
          {step === 6 && <Step6 data={data} onChange={update} />}
        </div>
        <NavButtons
          step={step}
          onBack={() => setStep((s) => s - 1)}
          onNext={handleNext}
          canNext={canNext()}
          loading={loading}
          lastStep={step === TOTAL_STEPS}
        />
      </div>
    </div>
  );
}
