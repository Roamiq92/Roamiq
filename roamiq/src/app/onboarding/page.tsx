"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabaseBrowser } from "../lib/supabase-browser";

// -----------------------------------------------------
// STEP DEFINITIONS
// -----------------------------------------------------
const STEPS = [
  { id: 1, title: "Destinazione", icon: "🌍" },
  { id: 2, title: "Partenza & Date", icon: "✈️" },
  { id: 3, title: "Budget", icon: "💰" },
  { id: 4, title: "Stile di Viaggio", icon: "✨" },
  { id: 5, title: "Cosa Vuoi Fare", icon: "🎡" },
  { id: 6, title: "Riepilogo", icon: "📋" }
];

export default function OnboardingPage() {
  const router = useRouter();

  // -----------------------------------------------------
  // FORM DATA — COMPLETE
  // -----------------------------------------------------
  const [formData, setFormData] = useState({
    destination: "",
    departureCity: "",
    startDate: "",
    endDate: "",
    numTravelers: 2,
    travelCompanions: "",
    budgetTotal: "",
    budgetLevel: "",
    travelStyle: [] as string[],
    interests: [] as string[],
    experiences: [] as string[],
    pace: "",
    specialRequests: "",
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // -----------------------------------------------------
  // FORM UTILS
  // -----------------------------------------------------
  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: string, item: string) => {
    const array = formData[field] as string[];
    if (array.includes(item)) {
      updateFormData(field, array.filter((i) => i !== item));
    } else {
      updateFormData(field, [...array, item]);
    }
  };

  // -----------------------------------------------------
  // SUBMIT LOGIC
  // -----------------------------------------------------
  const handleSubmit = async () => {
    setLoading(true);

    try {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (!user) {
        localStorage.setItem("pendingTrip", JSON.stringify(formData));
        router.push("/register");
        return;
      }

      // SAVE TRIP
      const { data: trip, error: tripError } = await supabaseBrowser
        .from("trip_requests")
        .insert({
          user_id: user.id,
          destination: formData.destination,
          start_date: formData.startDate,
          end_date: formData.endDate,
          num_travelers: formData.numTravelers,
          budget_total: formData.budgetTotal,
          travel_companions: formData.travelCompanions,
          special_requests: formData.specialRequests,
          departure_city: formData.departureCity,
        })
        .select()
        .single();

      if (tripError) throw tripError;

      // SAVE PREFERENCES
      await supabaseBrowser.from("travel_preferences").upsert({
        user_id: user.id,
        travel_style: formData.travelStyle,
        budget_level: formData.budgetLevel,
        pace: formData.pace,
        interests: formData.interests,
        experiences: formData.experiences,
      });

      router.push(`/trip/${trip.id}`);

    } catch (err) {
      console.error(err);
      alert("Errore. Riprova.");
    }

    setLoading(false);
  };

  // -----------------------------------------------------
  // CAN PROCEED VALIDATION
  // -----------------------------------------------------
  const canProceed = () => {
    if (currentStep === 1) return formData.destination.length > 1;
    if (currentStep === 2) return formData.departureCity.length > 1;
    if (currentStep === 3) return formData.budgetTotal.length > 0 || formData.budgetLevel.length > 0;
    if (currentStep === 4) return formData.travelStyle.length > 0;
    if (currentStep === 5) return formData.experiences.length > 0;
    return true;
  };

  // -----------------------------------------------------
  // RENDER PAGE
  // -----------------------------------------------------
  return (
    <div className="min-h-screen hero-bg">
      {/* -----------------------------------------------------
         NAVBAR WITH PROGRESS 
      ----------------------------------------------------- */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-slate-900/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Image src="/Logo.png" alt="ROAMIQ" width={120} height={35} />
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.id ? "bg-orange-500 text-white" : "bg-white/10 text-gray-400"
                  }`}
                >
                  {currentStep > step.id ? "✓" : step.id}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-8 h-0.5 ${currentStep > step.id ? "bg-orange-500" : "bg-white/10"}`} />
                )}
              </div>
            ))}
          </div>

          <Link href="/" className="text-gray-400 hover:text-white">✕</Link>
        </div>
      </header>

      <main className="pt-24 pb-32 px-6">
        <div className="max-w-2xl mx-auto">

          {/* -----------------------------------------------------
             STEP 1 — DESTINAZIONE
          ----------------------------------------------------- */}
          {currentStep === 1 && (
            <div className="text-center animate-fade-in">
              <span className="text-6xl mb-4 block">🌍</span>
              <h1 className="text-3xl font-bold mb-3">Dove vuoi andare?</h1>
              <input
                type="text"
                value={formData.destination}
                onChange={(e) => updateFormData("destination", e.target.value)}
                className="input-field text-xl py-5 text-center mt-6"
                placeholder="Parigi, Tokyo, Barcellona..."
              />
            </div>
          )}

          {/* -----------------------------------------------------
             STEP 2 — PARTENZA & DATE
          ----------------------------------------------------- */}
          {currentStep === 2 && (
            <div className="animate-fade-in">
              <div className="text-center mb-10">
                <span className="text-6xl block mb-4">✈️</span>
                <h1 className="text-3xl font-bold mb-3">Da dove parti?</h1>
              </div>

              <div className="space-y-6">
                <input
                  type="text"
                  placeholder="Milano, Roma Fiumicino, Venezia..."
                  value={formData.departureCity}
                  onChange={(e) => updateFormData("departureCity", e.target.value)}
                  className="input-field"
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">Data partenza</label>
                    <input
                      type="date"
                      className="input-field"
                      value={formData.startDate}
                      onChange={(e) => updateFormData("startDate", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">Data ritorno</label>
                    <input
                      type="date"
                      className="input-field"
                      value={formData.endDate}
                      onChange={(e) => updateFormData("endDate", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* -----------------------------------------------------
             STEP 3 — BUDGET
          ----------------------------------------------------- */}
          {currentStep === 3 && (
            <div className="text-center animate-fade-in">
              <span className="text-6xl block mb-4">💰</span>
              <h1 className="text-3xl font-bold mb-3">Qual è il tuo budget?</h1>

              <input
                type="number"
                placeholder="es. 1500"
                className="input-field mt-6 text-center"
                value={formData.budgetTotal}
                onChange={(e) => updateFormData("budgetTotal", e.target.value)}
              />
            </div>
          )}

          {/* -----------------------------------------------------
             STEP 4 — STILE DI VIAGGIO
          ----------------------------------------------------- */}
          {currentStep === 4 && (
            <div className="animate-fade-in">
              <div className="text-center mb-10">
                <span className="text-6xl block mb-4">✨</span>
                <h1 className="text-3xl font-bold mb-3">Che tipo di viaggio vuoi?</h1>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                {[
                  "avventura", "relax", "cultura",
                  "food", "romantico", "nightlife"
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleArrayItem("travelStyle", s)}
                    className={`px-4 py-2 rounded-full ${
                      formData.travelStyle.includes(s)
                        ? "bg-orange-500 text-white"
                        : "bg-white/10"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* -----------------------------------------------------
             STEP 5 — ESPERIENZE IN CITTÀ
          ----------------------------------------------------- */}
          {currentStep === 5 && (
            <div className="animate-fade-in">
              <div className="text-center mb-10">
                <span className="text-6xl block mb-4">🎡</span>
                <h1 className="text-3xl font-bold mb-3">
                  Cosa vuoi fare nella città?
                </h1>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                {[
                  "musei", "attrazioni", "tour guidati", "food & wine",
                  "ristoranti locali", "shopping", "nightlife",
                  "natura", "wellness", "eventi"
                ].map((exp) => (
                  <button
                    key={exp}
                    onClick={() => toggleArrayItem("experiences", exp)}
                    className={`px-4 py-2 rounded-full ${
                      formData.experiences.includes(exp)
                        ? "bg-orange-500 text-white"
                        : "bg-white/10"
                    }`}
                  >
                    {exp}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* -----------------------------------------------------
             STEP 6 — RIEPILOGO
          ----------------------------------------------------- */}
          {currentStep === 6 && (
            <div className="animate-fade-in">
              <div className="text-center mb-10">
                <span className="text-6xl block mb-4">📋</span>
                <h1 className="text-3xl font-bold mb-4">Riepilogo</h1>
              </div>

              <div className="glass-card text-left space-y-3">
                <p><strong>Destinazione:</strong> {formData.destination}</p>
                <p><strong>Partenza da:</strong> {formData.departureCity}</p>
                <p><strong>Date:</strong> {formData.startDate} → {formData.endDate}</p>
                <p><strong>Viaggiatori:</strong> {formData.numTravelers}</p>
                <p><strong>Budget:</strong> €{formData.budgetTotal || formData.budgetLevel}</p>
                <p><strong>Stile:</strong> {formData.travelStyle.join(", ")}</p>
                <p><strong>Esperienze:</strong> {formData.experiences.join(", ")}</p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary w-full mt-6"
              >
                {loading ? "Generazione in corso..." : "Genera Itinerario AI"}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* -----------------------------------------------------
         FOOTER NAVIGATION
      ----------------------------------------------------- */}
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg px-6 py-4 border-t border-white/10">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            className={currentStep === 1 ? "invisible" : "text-gray-300"}
          >
            ← Indietro
          </button>

          <span className="text-gray-400 text-sm">{currentStep} / 6</span>

          {currentStep < 6 ? (
            <button
              disabled={!canProceed()}
              onClick={() => setCurrentStep(currentStep + 1)}
              className={`px-6 py-2 rounded-xl ${
                canProceed() ? "btn-primary" : "bg-white/10 text-gray-400"
              }`}
            >
              Avanti →
            </button>
          ) : (
            <div></div>
          )}
        </div>
      </footer>
    </div>
  );
}
