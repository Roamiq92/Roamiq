"use client";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#090b10] via-[#0f121a] to-[#0a0b10] text-white flex flex-col items-center">
      {/* HERO */}
      <section className="flex flex-col justify-center items-center text-center mt-24 px-4">
        <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 leading-tight max-w-3xl">
          Il tuo viaggio, <span className="text-orange-400">intelligente</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mb-10">
          ROAMIQ utilizza l’intelligenza artificiale per pianificare, ottimizzare e farti vivere esperienze uniche in ogni città.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/onboarding" className="px-8 py-4 rounded-full bg-orange-500 text-black font-semibold text-lg hover:bg-orange-400 transition">
            🚀 Crea il tuo viaggio
          </Link>
          <Link href="/register" className="px-8 py-4 rounded-full border border-white/20 text-white font-semibold text-lg hover:bg-white/10 transition">
            Accedi / Registrati
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-5xl mt-32 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
        {[
          { icon: "🤖", title: "Pianificazione AI", text: "Itinerari su misura generati in secondi, adattati a te." },
          { icon: "🗺️", title: "Tutto in uno", text: "Volo, hotel e attività, gestiti in modo integrato e intelligente." },
          { icon: "🔄", title: "Re‑plan istantaneo", text: "Ogni variazione viene ottimizzata al volo con AI." },
          { icon: "💬", title: "Concierge AI", text: "Un assistente che ti segue durante tutto il viaggio Premium." },
          { icon: "🌍", title: "Guida Locale", text: "Suggerimenti autentici da esperti e guide del posto." },
          { icon: "⚡", title: "Prenotazioni smart", text: "Un click per volare, dormire e vivere esperienze uniche." }
        ].map((f, i) => (
          <div key={i} className="text-left border border-white/10 rounded-2xl p-6 bg-white/[0.05] hover:bg-white/[0.08] transition">
            <div className="text-3xl mb-4">{f.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
            <p className="text-gray-400">{f.text}</p>
          </div>
        ))}
      </section>

      {/* CTA FINALE */}
      <section className="mt-32 mb-20 text-center px-4">
        <h2 className="text-4xl font-bold mb-6">Pronto a viaggiare meglio?</h2>
        <Link href="/onboarding" className="px-10 py-5 bg-orange-500 text-black rounded-full text-lg font-semibold hover:bg-orange-400 transition">
          Inizia ora – Gratis
        </Link>
      </section>

      <footer className="w-full border-t border-white/10 text-center text-gray-400 py-6 text-sm">
        © {new Date().getFullYear()} ROAMIQ · The AI‑Powered Travel Operating System
      </footer>
    </div>
  );
}
