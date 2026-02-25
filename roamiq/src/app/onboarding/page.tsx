"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabaseBrowser } from "../lib/supabase-browser";

// Definizione degli step dell'onboarding
const STEPS = [
  { id: 1, title: "Destinazione", icon: "🌍" },
  { id: 2, title: "Date & Viaggiatori", icon: "📅" },
  { id: 3, title: "Budget", icon: "💰" },
  { id: 4, title: "Preferenze", icon: "✨" },
  { id: 5, title: "Richiesta", icon: "🎯" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    numTravelers: 2,
    travelCompanions: "",
    budgetTotal: "",
    budgetLevel: "",
    travelStyle: [] as string[],
    interests: [] as string[],
    accommodationType: "",
    pace: "",
    specialRequests: "",
  });

  const updateFormData = (field: string, value: string | number | string[]) => {
    setFormData({ ...formData, [field]: value });
  };

  const toggleArrayItem = (field: string, item: string) => {
    const currentArray = formData[field as keyof typeof formData] as string[];
    if (currentArray.includes(item)) {
      updateFormData(field, currentArray.filter(i => i !== item));
    } else {
      updateFormData(field, [...currentArray, item]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Ottieni l'utente corrente
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      
      if (!user) {
        // Se non loggato, salva in localStorage e redirect al login
        localStorage.setItem('pendingTrip', JSON.stringify(formData));
        router.push('/register');
        return;
      }

      // Salva la richiesta di viaggio
      const { data: tripData, error: tripError } = await supabaseBrowser
        .from('trip_requests')
        .insert({
          user_id: user.id,
          destination: formData.destination,
          start_date: formData.startDate || null,
          end_date: formData.endDate || null,
          num_travelers: formData.numTravelers,
          budget_total: formData.budgetTotal ? parseFloat(formData.budgetTotal) : null,
          travel_companions: formData.travelCompanions,
          special_requests: formData.specialRequests,
          status: 'pending'
        })
        .select()
        .single();

      if (tripError) throw tripError;

      // Salva le preferenze
      const { error: prefError } = await supabaseBrowser
        .from('travel_preferences')
        .upsert({
          user_id: user.id,
          travel_style: formData.travelStyle,
          budget_level: formData.budgetLevel,
          pace: formData.pace,
          accommodation_type: formData.accommodationType ? [formData.accommodationType] : [],
          interests: formData.interests,
        });

      if (prefError) throw prefError;

      // Redirect alla pagina di generazione itinerario
      router.push(`/trip/${tripData.id}`);
      
    } catch (error) {
      console.error('Errore:', error);
      alert('Si è verificato un errore. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Verifica se lo step corrente è valido per procedere
  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.destination.length > 0;
      case 2: return formData.travelCompanions.length > 0;
      case 3: return formData.budgetLevel.length > 0;
      case 4: return formData.travelStyle.length > 0;
      case 5: return true;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen hero-bg">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-slate-900/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Image src="/Logo.png" alt="ROAMIQ" width={120} height={35} className="h-8 w-auto" />
          </Link>
          
          {/* Progress indicator */}
          <div className="hidden sm:flex items-center gap-2">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  currentStep >= step.id 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-white/10 text-gray-400'
                }`}>
                  {currentStep > step.id ? '✓' : step.id}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-8 h-0.5 ${currentStep > step.id ? 'bg-orange-500' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>

          <Link href="/" className="text-gray-400 hover:text-white text-sm">
            ✕ Chiudi
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-32 px-6">
        <div className="max-w-2xl mx-auto">
          
          {/* Step 1: Destinazione */}
          {currentStep === 1 && (
            <div className="animate-fade-in">
              <div className="text-center mb-10">
                <span className="text-6xl mb-4 block">🌍</span>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">Dove vuoi andare?</h1>
                <p className="text-gray-400 text-lg">Inserisci la città o il paese dei tuoi sogni</p>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="es. Parigi, Tokyo, Barcellona..."
                  value={formData.destination}
                  onChange={(e) => updateFormData('destination', e.target.value)}
                  className="input-field text-xl py-5 text-center"
                  autoFocus
                />
                
                {/* Destinazioni popolari */}
                <div className="pt-6">
                  <p className="text-gray-500 text-sm mb-3 text-center">Destinazioni popolari</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['Parigi', 'Roma', 'Barcellona', 'Amsterdam', 'Londra', 'Praga'].map((city) => (
                      <button
                        key={city}
                        onClick={() => updateFormData('destination', city)}
                        className={`px-4 py-2 rounded-full text-sm transition ${
                          formData.destination === city
                            ? 'bg-orange-500 text-white'
                            : 'bg-white/5 text-gray-300 hover:bg-white/10'
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Date & Viaggiatori */}
          {currentStep === 2 && (
            <div className="animate-fade-in">
              <div className="text-center mb-10">
                <span className="text-6xl mb-4 block">📅</span>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">Quando e con chi?</h1>
                <p className="text-gray-400 text-lg">Dicci le date e chi ti accompagna</p>
              </div>
              
              <div className="space-y-6">
                {/* Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Data partenza</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => updateFormData('startDate', e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Data ritorno</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => updateFormData('endDate', e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Numero viaggiatori */}
                <div>
                  <label className="block text-sm text-gray-400 mb-3">Quanti siete?</label>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => updateFormData('numTravelers', Math.max(1, formData.numTravelers - 1))}
                      className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-xl transition"
                    >
                      -
                    </button>
                    <span className="text-4xl font-bold w-16 text-center">{formData.numTravelers}</span>
                    <button
                      onClick={() => updateFormData('numTravelers', formData.numTravelers + 1)}
                      className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-xl transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Tipo di compagnia */}
                <div>
                  <label className="block text-sm text-gray-400 mb-3">Con chi viaggi?</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'solo', label: 'Da solo', icon: '🧑' },
                      { id: 'coppia', label: 'In coppia', icon: '💑' },
                      { id: 'famiglia', label: 'Famiglia', icon: '👨‍👩‍👧‍👦' },
                      { id: 'amici', label: 'Amici', icon: '👯' },
                      { id: 'lavoro', label: 'Lavoro', icon: '💼' },
                      { id: 'altro', label: 'Altro', icon: '👥' },
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => updateFormData('travelCompanions', option.id)}
                        className={`p-4 rounded-xl text-center transition ${
                          formData.travelCompanions === option.id
                            ? 'bg-orange-500 text-white'
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-2xl block mb-1">{option.icon}</span>
                        <span className="text-sm">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Budget */}
          {currentStep === 3 && (
            <div className="animate-fade-in">
              <div className="text-center mb-10">
                <span className="text-6xl mb-4 block">💰</span>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">Qual è il tuo budget?</h1>
                <p className="text-gray-400 text-lg">Budget totale per tutto il viaggio</p>
              </div>
              
              <div className="space-y-6">
                {/* Input budget */}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-gray-400">€</span>
                  <input
                    type="number"
                    placeholder="2000"
                    value={formData.budgetTotal}
                    onChange={(e) => updateFormData('budgetTotal', e.target.value)}
                    className="input-field text-xl py-5 text-center pl-10"
                  />
                </div>

                {/* Budget level */}
                <div>
                  <label className="block text-sm text-gray-400 mb-3 text-center">Oppure seleziona un livello</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'economico', label: 'Economico', desc: 'Ostelli, street food', icon: '🎒' },
                      { id: 'medio', label: 'Medio', desc: 'Hotel 3★, ristoranti', icon: '🏨' },
                      { id: 'premium', label: 'Premium', desc: 'Hotel 4★, esperienze', icon: '✨' },
                      { id: 'lusso', label: 'Lusso', desc: 'Hotel 5★, esclusività', icon: '👑' },
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => updateFormData('budgetLevel', option.id)}
                        className={`p-4 rounded-xl text-left transition ${
                          formData.budgetLevel === option.id
                            ? 'bg-orange-500 text-white'
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-2xl">{option.icon}</span>
                        <span className="font-medium block mt-2">{option.label}</span>
                        <span className={`text-sm ${formData.budgetLevel === option.id ? 'text-orange-100' : 'text-gray-400'}`}>
                          {option.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Preferenze */}
          {currentStep === 4 && (
            <div className="animate-fade-in">
              <div className="text-center mb-10">
                <span className="text-6xl mb-4 block">✨</span>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">Come ti piace viaggiare?</h1>
                <p className="text-gray-400 text-lg">Seleziona tutto ciò che ti interessa</p>
              </div>
              
              <div className="space-y-8">
                {/* Stile di viaggio */}
                <div>
                  <label className="block text-sm text-gray-400 mb-3">Stile di viaggio</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'avventura', label: '🏔️ Avventura' },
                      { id: 'relax', label: '🧘 Relax' },
                      { id: 'cultura', label: '🏛️ Cultura' },
                      { id: 'food', label: '🍕 Food & Wine' },
                      { id: 'romantico', label: '💕 Romantico' },
                      { id: 'festaiolo', label: '🎉 Nightlife' },
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => toggleArrayItem('travelStyle', option.id)}
                        className={`px-4 py-2 rounded-full transition ${
                          formData.travelStyle.includes(option.id)
                            ? 'bg-orange-500 text-white'
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interessi */}
                <div>
                  <label className="block text-sm text-gray-400 mb-3">Interessi specifici</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'musei', label: '🖼️ Musei' },
                      { id: 'natura', label: '🌿 Natura' },
                      { id: 'shopping', label: '🛍️ Shopping' },
                      { id: 'sport', label: '⚽ Sport' },
                      { id: 'foto', label: '📸 Fotografia' },
                      { id: 'storia', label: '📚 Storia' },
                      { id: 'locale', label: '🏘️ Vita locale' },
                      { id: 'spiaggia', label: '🏖️ Spiaggia' },
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => toggleArrayItem('interests', option.id)}
                        className={`px-4 py-2 rounded-full transition ${
                          formData.interests.includes(option.id)
                            ? 'bg-orange-500 text-white'
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ritmo */}
                <div>
                  <label className="block text-sm text-gray-400 mb-3">Ritmo del viaggio</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'rilassato', label: 'Rilassato', desc: 'Poche attività al giorno' },
                      { id: 'moderato', label: 'Moderato', desc: 'Mix equilibrato' },
                      { id: 'intenso', label: 'Intenso', desc: 'Vedere tutto!' },
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => updateFormData('pace', option.id)}
                        className={`p-3 rounded-xl transition ${
                          formData.pace === option.id
                            ? 'bg-orange-500 text-white'
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <span className="font-medium block">{option.label}</span>
                        <span className={`text-xs ${formData.pace === option.id ? 'text-orange-100' : 'text-gray-400'}`}>
                          {option.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Richieste speciali */}
          {currentStep === 5 && (
            <div className="animate-fade-in">
              <div className="text-center mb-10">
                <span className="text-6xl mb-4 block">🎯</span>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">Quasi fatto!</h1>
                <p className="text-gray-400 text-lg">Vuoi aggiungere qualcosa?</p>
              </div>
              
              <div className="space-y-6">
                <textarea
                  placeholder="Es: Vorrei un ristorante con vista sulla Torre Eiffel, evitare posti troppo turistici, ho bisogno di accessibilità per carrozzina..."
                  value={formData.specialRequests}
                  onChange={(e) => updateFormData('specialRequests', e.target.value)}
                  className="input-field min-h-[150px] resize-none"
                />

                {/* Riepilogo */}
                <div className="glass-card">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    📋 Riepilogo del tuo viaggio
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-400">Destinazione:</span> <span className="font-medium">{formData.destination}</span></p>
                    {formData.startDate && (
                      <p><span className="text-gray-400">Date:</span> <span className="font-medium">{formData.startDate} → {formData.endDate}</span></p>
                    )}
                    <p><span className="text-gray-400">Viaggiatori:</span> <span className="font-medium">{formData.numTravelers} persone ({formData.travelCompanions})</span></p>
                    <p><span className="text-gray-400">Budget:</span> <span className="font-medium">{formData.budgetTotal ? `€${formData.budgetTotal}` : formData.budgetLevel}</span></p>
                    <p><span className="text-gray-400">Stile:</span> <span className="font-medium">{formData.travelStyle.join(', ')}</span></p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-white/5 px-6 py-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <button
            onClick={prevStep}
            className={`px-6 py-3 rounded-xl font-medium transition ${
              currentStep === 1
                ? 'invisible'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            ← Indietro
          </button>

          <span className="text-gray-400 text-sm">
            {currentStep} di {STEPS.length}
          </span>

          {currentStep < 5 ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className={`px-6 py-3 rounded-xl font-medium transition ${
                canProceed()
                  ? 'btn-primary'
                  : 'bg-white/5 text-gray-500 cursor-not-allowed'
              }`}
            >
              Avanti →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary px-8 py-3 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generazione...
                </>
              ) : (
                <>🚀 Genera Itinerario</>
              )}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
