"use client";

import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="hero-bg">
      {/* NAVBAR */}
      <nav className="navbar flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Image 
            src="/Logo.png" 
            alt="ROAMIQ" 
            width={140} 
            height={40}
            className="h-10 w-auto"
          />
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-gray-300 hover:text-white transition">Features</a>
          <a href="#how-it-works" className="text-gray-300 hover:text-white transition">Come Funziona</a>
          <a href="#pricing" className="text-gray-300 hover:text-white transition">Prezzi</a>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-gray-300 hover:text-white transition">
            Accedi
          </Link>
          <Link href="/register" className="btn-primary">
            Inizia Gratis
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          
          {/* Badge */}
          <div className="animate-fade-in inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-sm text-gray-300">Powered by AI</span>
          </div>
          
          {/* Titolo */}
          <h1 className="animate-fade-in animate-delay-1 text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Il Tuo Viaggio,{" "}
            <span className="gradient-text">Intelligente</span>
          </h1>
          
          {/* Sottotitolo */}
          <p className="animate-fade-in animate-delay-2 text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto">
            ROAMIQ trasforma il modo in cui pianifichi i viaggi. Un&apos;AI che ti conosce, 
            itinerari personalizzati e prenotazioni in un click.
          </p>
          
          {/* CTA Buttons */}
          <div className="animate-fade-in animate-delay-3 flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/onboarding" className="btn-primary text-lg px-8 py-4">
              🚀 Crea il Tuo Viaggio
            </Link>
            <button className="btn-secondary text-lg px-8 py-4">
              ▶️ Guarda Demo
            </button>
          </div>
          
          {/* Stats */}
          <div className="animate-fade-in animate-delay-4 flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text">50+</div>
              <div className="text-gray-400">Città</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text">10K+</div>
              <div className="text-gray-400">Viaggiatori</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text">4.9★</div>
              <div className="text-gray-400">Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="section">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Perché <span className="gradient-text">ROAMIQ</span>?
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Non un&apos;altra app di viaggi. Un sistema operativo intelligente per le tue avventure.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="glass-card">
            <div className="feature-icon">🎯</div>
            <h3 className="text-xl font-bold mb-3">Personalizzazione AI</h3>
            <p className="text-gray-400">
              L&apos;AI apprende i tuoi gusti, budget e stile di viaggio per creare itinerari su misura.
            </p>
          </div>
          
          {/* Feature 2 */}
          <div className="glass-card">
            <div className="feature-icon">👥</div>
            <h3 className="text-xl font-bold mb-3">Viaggi di Gruppo</h3>
            <p className="text-gray-400">
              Algoritmo che trova il compromesso perfetto tra preferenze diverse. Niente più discussioni!
            </p>
          </div>
          
          {/* Feature 3 */}
          <div className="glass-card">
            <div className="feature-icon">⚡</div>
            <h3 className="text-xl font-bold mb-3">Booking Istantaneo</h3>
            <p className="text-gray-400">
              Prenota voli, hotel ed esperienze direttamente dall&apos;itinerario con un click.
            </p>
          </div>
          
          {/* Feature 4 */}
          <div className="glass-card">
            <div className="feature-icon">🗺️</div>
            <h3 className="text-xl font-bold mb-3">Guida Real-time</h3>
            <p className="text-gray-400">
              Navigazione contestuale, suggerimenti live e audio-guide mentre esplori.
            </p>
          </div>
          
          {/* Feature 5 */}
          <div className="glass-card">
            <div className="feature-icon">💰</div>
            <h3 className="text-xl font-bold mb-3">Budget Smart</h3>
            <p className="text-gray-400">
              Ottimizzazione automatica di prezzi e disponibilità per farti risparmiare.
            </p>
          </div>
          
          {/* Feature 6 */}
          <div className="glass-card">
            <div className="feature-icon">🌍</div>
            <h3 className="text-xl font-bold mb-3">Local Knowledge</h3>
            <p className="text-gray-400">
              Accesso a guide locali e esperienze autentiche, non turistiche.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="section">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Come <span className="gradient-text">Funziona</span>
          </h2>
          <p className="text-xl text-gray-400">
            3 step per il viaggio perfetto
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
              1
            </div>
            <h3 className="text-2xl font-bold mb-3">Raccontaci di Te</h3>
            <p className="text-gray-400">
              Compila l&apos;onboarding intelligente: interessi, budget, stile, con chi viaggi.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
              2
            </div>
            <h3 className="text-2xl font-bold mb-3">L&apos;AI Crea per Te</h3>
            <p className="text-gray-400">
              In secondi ricevi un itinerario dettagliato, costificato e personalizzato.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
              3
            </div>
            <h3 className="text-2xl font-bold mb-3">Prenota e Parti</h3>
            <p className="text-gray-400">
              Conferma con un click. ROAMIQ ti guida durante tutto il viaggio.
            </p>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <Link href="/onboarding" className="btn-primary text-lg px-10 py-4">
            Inizia Ora — È Gratis
          </Link>
        </div>
      </section>

      {/* CTA FINALE */}
      <section className="section">
        <div className="glass-card text-center py-16 px-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Pronto a Viaggiare <span className="gradient-text">Intelligente</span>?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Unisciti a migliaia di viaggiatori che hanno già rivoluzionato il modo di esplorare il mondo.
          </p>
          <Link href="/register" className="btn-primary text-xl px-12 py-5">
            Crea Account Gratuito
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Image 
              src="/Logo.png" 
              alt="ROAMIQ" 
              width={120} 
              height={35}
              className="h-8 w-auto"
            />
          </div>
          
          <div className="flex gap-8 text-gray-400">
            <a href="#" className="hover:text-white transition">Privacy</a>
            <a href="#" className="hover:text-white transition">Termini</a>
            <a href="#" className="hover:text-white transition">Contatti</a>
          </div>
          
          <div className="text-gray-500">
            © 2025 ROAMIQ. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
