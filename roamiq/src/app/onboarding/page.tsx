"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabaseBrowser } from "../lib/supabase-browser";

// -----------------------------------------------------
// TYPE DEFINITIONS
// -----------------------------------------------------
type ArrayFields = "travelStyle" | "interests" | "experiences";

type FormDataType = {
  destination: string;
  departureCity: string;
  startDate: string;
  endDate: string;
  numTravelers: number;
  travelCompanions: string;
  budgetTotal: string;
  budgetLevel: string;
  travelStyle: string[];
  interests: string[];
  experiences: string[];
  pace: string;
  specialRequests: string;
};

// -----------------------------------------------------

const STEPS = [
  { id: 1, title: "Destinazione", icon: "🌍" },
  { id: 2, title: "Partenza & Date", icon: "✈️" },
  { id: 3, title: "Budget", icon: "💰" },
  { id: 4, title: "Stile", icon: "✨" },
  { id: 5, title: "Cosa vuoi fare", icon: "🎡" },
  { id: 6, title: "Riepilogo", icon: "📋" },
];

export default function OnboardingPage() {
  const router = useRouter();

  // -----------------------------------------------------
  // FORM DATA
  // -----------------------------------------------------
  const [formData, setFormData] = useState<FormDataType>({
    destination: "",
    departureCity: "",
    startDate: "",
    endDate: "",
    numTravelers: 2,
    travelCompanions: "",
    budgetTotal: "",
    budgetLevel: "",
    travelStyle: [],
    interests: [],
    experiences: [],
    pace: "",
    specialRequests: "",
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // -----------------------------------------------------
  // HELPERS
  // -----------------------------------------------------
  const updateFormData = (field: keyof FormDataType, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: ArrayFields, value: string) => {
    const arr = formData[field];
    if (arr.includes(value)) {
      updateFormData(field, arr.filter((v) => v !== value));
    } else {
      updateFormData(field, [...arr, value]);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) return formData.destination.length > 1;
    if (currentStep === 2) return formData.departureCity.length > 1;
    if (currentStep === 3) return formData.budgetTotal.length > 0;
    if (currentStep === 4) return formData.travelStyle.length > 0;
    if (currentStep === 5) return formData.experiences.length > 0;
    return true;
  };

  // -----------------------------------------------------
  // SUBMIT
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

      const { data: trip } = await supabaseBrowser
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
  // UI
  // -----------------------------------------------------
  return (
    <div className="min-h-screen hero-bg">

      {/* TOP BAR */}
      <header className="fixed top-0 left-0 right-0 px-6 py-4 bg-slate-900/80 z-40 flex justify-between items-center">
        <Link href="/"><Image src="/Logo.png" alt="logo" width={120} height={40}/></Link>
        <span className="text-gray-400">{currentStep}/6</span>
        <Link href="/" className="text-gray-400">✕</Link>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto">

        {/* STEP 1 */}
        {currentStep === 1 && (
          <div className="text-center animate-fade-in">
            <span className="text-7xl mb-6 block">🌍</span>
            <h1 className="text-3xl font-bold mb-6">Dove vuoi andare?</h1>

            <input
              type="text"
              className="input-field w-full text-center text-xl py-5"
              placeholder="Parigi, Tokyo..."
              value={formData.destination}
              onChange={(e) => updateFormData("destination", e.target.value)}
            />
          </div>
        )}

        {/* STEP 2 */}
        {currentStep === 2 && (
          <div className="animate-fade-in">
            <div className="text-center mb-10">
              <span className="text-7xl block mb-6">✈️</span>
              <h1 className="text-3xl font-bold">Da dove parti?</h1>
            </div>

            <input
              type="text"
              className="input-field w-full"
              placeholder="Milano, Roma..."
              value={formData.departureCity}
              onChange={(e) => updateFormData("departureCity", e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4 mt-6">
              <input
                type="date"
                className="input-field"
                value={formData.startDate}
                onChange={(e) => updateFormData("startDate", e.target.value)}
              />
              <input
                type="date"
                className="input-field"
                value={formData.endDate}
                onChange={(e) => updateFormData("endDate", e.target.value)}
              />
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {currentStep === 3 && (
          <div className="text-center animate-fade-in">
            <span className="text-7xl block mb-6">💰</span>
            <h1 className="text-3xl font-bold">Budget totale?</h1>

            <input
              type="number"
              className="input-field w-full mt-6 text-center"
              placeholder="1500"
              value={formData.budgetTotal}
              onChange={(e) => updateFormData("budgetTotal", e.target.value)}
            />
          </div>
        )}

        {/* STEP 4 */}
        {currentStep === 4 && (
          <div className="animate-fade-in text-center">
            <span className="text-7xl block mb-6">✨</span>
            <h1 className="text-3xl font-bold">Che tipo di viaggio?</h1>

            <div className="flex flex-wrap gap-3 justify-center mt-6">
              {["avventura","relax","cultura","food","romantico","nightlife"].map((s) => (
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

        {/* STEP 5 */}
        {currentStep === 5 && (
          <div className="animate-fade-in text-center">
            <span className="text-7xl block mb-6">🎡</span>
            <h1 className="text-3xl font-bold">Cosa vuoi fare?</h1>

            <div className="flex flex-wrap gap-3 justify-center mt-6">
              {[
                "musei","attrazioni","tour guidati","ristoranti",
                "shopping","nightlife","natura","wellness"
              ].map((s) => (
                <button
                  key={s}
                  onClick={() => toggleArrayItem("experiences", s)}
                  className={`px-4 py-2 rounded-full ${
                    formData.experiences.includes(s)
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

        {/* STEP 6 */}
        {currentStep === 6 && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-center mb-6">Riepilogo</h1>

            <div className="glass-card space-y-3">
              <p><strong>Destinazione:</strong> {formData.destination}</p>
              <p><strong>Partenza:</strong> {formData.departureCity}</p>
              <p><strong>Date:</strong> {formData.startDate} → {formData.endDate}</p>
              <p><strong>Viaggiatori:</strong> {formData.numTravelers}</p>
              <p><strong>Budget:</strong> €{formData.budgetTotal}</p>
              <p><strong>Stile:</strong> {formData.travelStyle.join(", ")}</p>
              <p><strong>Esperienze:</strong> {formData.experiences.join(", ")}</p>
            </div>

            <button
              className="btn-primary w-full mt-8"
              onClick={handleSubmit}
            >
              {loading ? "Generazione..." : "Genera Itinerario AI"}
            </button>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="fixed bottom-0 left-0 right-0 px-6 py-4 bg-slate-900/80">
        <div className="max-w-2xl mx-auto flex justify-between">
          {currentStep > 1 ? (
            <button
              className="text-gray-300"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              ← Indietro
            </button>
          ) : (
            <div></div>
          )}

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
