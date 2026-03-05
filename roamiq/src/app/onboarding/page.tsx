"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabaseBrowser } from "../lib/supabase-browser";

// ----------------------
// Types
// ----------------------
type ArrayFields = "travelStyle" | "experiences";

type FormDataType = {
  destination: string;
  departureCity: string;
  startDate: string;
  endDate: string;
  numTravelers: number;
  travelCompanions: string;
  budgetTotal: string;
  travelStyle: string[];
  experiences: string[];
  pace: string;
  specialRequests: string;
};

// ----------------------
// Steps
// ----------------------
const STEPS = [
  { id: 1, label: "Destinazione" },
  { id: 2, label: "Partenza" },
  { id: 3, label: "Budget" },
  { id: 4, label: "Stile" },
  { id: 5, label: "Esperienze" },
  { id: 6, label: "Riepilogo" }
];

// ----------------------
// Dynamic Background Loader
// ----------------------
async function fetchCityBackground(city: string) {
  try {
    const url = `https://source.unsplash.com/1600x900/?${encodeURIComponent(city)},city,landscape`;
    return url;
  } catch {
    return "/fallback.jpg";
  }
}

export default function OnboardingPage() {
  const router = useRouter();

  // ----------------------
  // States
  // ----------------------
  const [bgImage, setBgImage] = useState("/fallback.jpg");

  const [formData, setFormData] = useState<FormDataType>({
    destination: "",
    departureCity: "",
    startDate: "",
    endDate: "",
    numTravelers: 2,
    travelCompanions: "",
    budgetTotal: "",
    travelStyle: [],
    experiences: [],
    pace: "",
    specialRequests: ""
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // ----------------------
  // Load background on destination change
  // ----------------------
  useEffect(() => {
    if (formData.destination.length > 1) {
      fetchCityBackground(formData.destination).then((img) => {
        setBgImage(img);
      });
    }
  }, [formData.destination]);

  // ----------------------
  // Update form field
  // ----------------------
  const updateFormData = (field: keyof FormDataType, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ----------------------
  // Toggle array items
  // ----------------------
  const toggleArrayItem = (field: ArrayFields, value: string) => {
    const arr = formData[field];
    if (arr.includes(value)) {
      updateFormData(field, arr.filter((v) => v !== value));
    } else {
      updateFormData(field, [...arr, value]);
    }
  };

  // ----------------------
  // Validation
  // ----------------------
  const canProceed = () => {
    if (currentStep === 1) return formData.destination.length > 1;
    if (currentStep === 2) return formData.departureCity.length > 1;
    if (currentStep === 3) return formData.budgetTotal.length > 0;
    if (currentStep === 4) return formData.travelStyle.length > 0;
    if (currentStep === 5) return formData.experiences.length > 0;
    return true;
  };

  // ----------------------
  // Submit handler
  // ----------------------
  const handleSubmit = async () => {
    setLoading(true);

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
        departure_city: formData.departureCity
      })
      .select()
      .single();

    await supabaseBrowser.from("travel_preferences").upsert({
      user_id: user.id,
      travel_style: formData.travelStyle,
      experiences: formData.experiences,
      pace: formData.pace
    });

    router.push(`/trip/${trip.id}`);
  };

  // ----------------------
  // UI
  // ----------------------
  return (
    <div className="relative min-h-screen w-full overflow-hidden text-white">

      {/* Dynamic blurred background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${bgImage})`,
          filter: "blur(38px) brightness(0.38)"
        }}
      />

      {/* Titanium Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/65 to-black/85" />

      {/* CONTENT */}
      <div className="relative z-20 flex flex-col items-center min-h-screen pt-28 pb-20">

        {/* PROGRESS BAR */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition ${
                  currentStep === step.id
                    ? "bg-white text-black"
                    : currentStep > step.id
                    ? "bg-orange-500 text-black"
                    : "bg-white/30 text-white"
                }`}
              >
                {step.id}
              </div>
              {idx < STEPS.length - 1 && (
                <div className="w-10 h-[2px] bg-white/20 mx-2" />
              )}
            </div>
          ))}
        </div>

        {/* CARD */}
        <div className="w-full max-w-lg px-6">
          <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl p-8 flex flex-col items-center">

            {/* STEP 1 */}
            {currentStep === 1 && (
              <>
                <div className="text-7xl mb-5">🌍</div>
                <h1 className="text-3xl font-bold mb-6 text-center">
                  Dove vuoi andare?
                </h1>

                <input
                  type="text"
                  className="input-field text-center text-lg py-4 w-full bg-white/10 border border-white/20 rounded-xl"
                  placeholder="Parigi, Tokyo, New York..."
                  value={formData.destination}
                  onChange={(e) => updateFormData("destination", e.target.value)}
                />
              </>
            )}

            {/* STEP 2 */}
            {currentStep === 2 && (
              <>
                <div className="text-7xl mb-5">✈️</div>
                <h1 className="text-3xl font-bold mb-6 text-center">
                  Da dove parti?
                </h1>

                <input
                  type="text"
                  className="input-field text-center py-4 mb-5 w-full bg-white/10 border border-white/20 rounded-xl"
                  placeholder="Milano, Roma Fiumicino..."
                  value={formData.departureCity}
                  onChange={(e) =>
                    updateFormData("departureCity", e.target.value)
                  }
                />

                <div className="grid grid-cols-2 gap-4 w-full">
                  <input
                    type="date"
                    className="input-field bg-white/10 border border-white/20 rounded-xl py-3 px-4"
                    value={formData.startDate}
                    onChange={(e) =>
                      updateFormData("startDate", e.target.value)
                    }
                  />
                  <input
                    type="date"
                    className="input-field bg-white/10 border border-white/20 rounded-xl py-3 px-4"
                    value={formData.endDate}
                    onChange={(e) => updateFormData("endDate", e.target.value)}
                  />
                </div>
              </>
            )}

            {/* STEP 3 */}
            {currentStep === 3 && (
              <>
                <div className="text-7xl mb-5">💰</div>
                <h1 className="text-3xl font-bold mb-6 text-center">
                  Budget totale?
                </h1>

                <input
                  type="number"
                  className="input-field text-center py-4 w-full bg-white/10 border border-white/20 rounded-xl"
                  placeholder="1500"
                  value={formData.budgetTotal}
                  onChange={(e) =>
                    updateFormData("budgetTotal", e.target.value)
                  }
                />
              </>
            )}

            {/* STEP 4 */}
            {currentStep === 4 && (
              <>
                <div className="text-7xl mb-5">✨</div>
                <h1 className="text-3xl font-bold mb-6 text-center">
                  Che stile vuoi?
                </h1>

                <div className="flex flex-wrap justify-center gap-3">
                  {["avventura", "relax", "cultura", "food", "romantico", "nightlife"].map(
                    (s) => (
                      <button
                        key={s}
                        onClick={() => toggleArrayItem("travelStyle", s)}
                        className={`px-4 py-2 rounded-full transition ${
                          formData.travelStyle.includes(s)
                            ? "bg-orange-500 text-black"
                            : "bg-white/10 text-white"
                        }`}
                      >
                        {s}
                      </button>
                    )
                  )}
                </div>
              </>
            )}

            {/* STEP 5 */}
            {currentStep === 5 && (
              <>
                <div className="text-7xl mb-5">🎡</div>
                <h1 className="text-3xl font-bold mb-6 text-center">
                  Cosa vuoi fare?
                </h1>

                <div className="flex flex-wrap justify-center gap-3">
                  {[
                    "musei",
                    "attrazioni",
                    "tour guidati",
                    "ristoranti",
                    "shopping",
                    "nightlife",
                    "natura",
                    "wellness"
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleArrayItem("experiences", s)}
                      className={`px-4 py-2 rounded-full transition ${
                        formData.experiences.includes(s)
                          ? "bg-orange-500 text-black"
                          : "bg-white/10 text-white"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* STEP 6 */}
            {currentStep === 6 && (
              <>
                <div className="text-7xl mb-5">📋</div>
                <h1 className="text-3xl font-bold mb-6 text-center">
                  Riepilogo
                </h1>

                <div className="space-y-2 text-lg text-white/90">
                  <p><b>Destinazione:</b> {formData.destination}</p>
                  <p><b>Partenza da:</b> {formData.departureCity}</p>
                  <p><b>Date:</b> {formData.startDate} → {formData.endDate}</p>
                  <p><b>Budget:</b> €{formData.budgetTotal}</p>
                  <p><b>Stile:</b> {formData.travelStyle.join(", ")}</p>
                  <p><b>Esperienze:</b> {formData.experiences.join(", ")}</p>
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full py-4 text-lg bg-orange-500 text-black rounded-xl mt-8 hover:bg-orange-400 transition"
                  disabled={loading}
                >
                  {loading ? "Generazione..." : "Genera Itinerario AI"}
                </button>
              </>
            )}

          </div>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="flex justify-between w-full max-w-lg px-6 mt-6">
          <button
            onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
            className={`text-white/80 text-lg ${currentStep === 1 ? "invisible" : ""}`}
          >
            ← Indietro
          </button>

          {currentStep < 6 && (
            <button
              disabled={!canProceed()}
              onClick={() => setCurrentStep(currentStep + 1)}
              className={`px-6 py-2 text-lg rounded-full ${
                canProceed()
                  ? "bg-orange-500 text-black hover:bg-orange-400"
                  : "bg-white/10 text-white/40"
              }`}
            >
              Avanti →
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
