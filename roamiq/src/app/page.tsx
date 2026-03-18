import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* ── NAV ── */}
      <nav className="rq-nav">
        <Link href="/" className="rq-logo">ROAM<span>IQ</span></Link>
        <div className="rq-nav-links">
          <Link href="/login" className="rq-nav-link">Accedi</Link>
          <Link href="/onboarding" className="rq-nav-cta">Inizia gratis</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="rq-hero">
        {/* Destination words floating */}
        <div className="rq-destinations">
          <span className="rq-dest rq-dest-1">Tokyo</span>
          <span className="rq-dest rq-dest-2">Lisbona</span>
          <span className="rq-dest rq-dest-3">Marrakech</span>
          <span className="rq-dest rq-dest-4">Kyoto</span>
          <span className="rq-dest rq-dest-5">Buenos Aires</span>
          <span className="rq-dest rq-dest-6">Dublino</span>
        </div>

        <div className="rq-hero-content">
          <div className="rq-hero-eyebrow">
            <span className="rq-pulse" />
            Il tuo personal travel AI
          </div>
          <h1 className="rq-hero-title">
            Il viaggio<br />
            <em>dei tuoi sogni</em><br />
            in 30 secondi.
          </h1>
          <p className="rq-hero-sub">
            Dimmi dove vuoi andare. L&apos;AI pianifica tutto —
            giorno per giorno, euro per euro.
          </p>
          <div className="rq-hero-actions">
            <Link href="/onboarding" className="rq-btn-hero">
              Pianifica il mio viaggio
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
          <div className="rq-hero-proof">
            <span>✈️ Gratis per iniziare</span>
            <span className="rq-dot-sep">·</span>
            <span>🗺️ Itinerario in 30 secondi</span>
            <span className="rq-dot-sep">·</span>
            <span>💶 Costificato al centesimo</span>
          </div>
        </div>

        {/* Floating itinerary card */}
        <div className="rq-hero-card">
          <div className="rq-card-header">
            <div className="rq-card-dest">🇯🇵 Tokyo · 5 giorni</div>
            <div className="rq-card-ai-badge">
              <span className="rq-ai-dot" />
              AI generato
            </div>
          </div>
          <div className="rq-card-days">
            <div className="rq-card-day active">
              <div className="rq-day-num">Lun</div>
              <div className="rq-day-items">
                <div className="rq-day-item">
                  <span className="rq-item-icon">⛩️</span>
                  <div>
                    <div className="rq-item-name">Senso-ji Temple</div>
                    <div className="rq-item-meta">09:00 · Gratuito</div>
                  </div>
                </div>
                <div className="rq-day-item">
                  <span className="rq-item-icon">🍜</span>
                  <div>
                    <div className="rq-item-name">Ramen Ichiran</div>
                    <div className="rq-item-meta">13:00 · €12</div>
                  </div>
                </div>
                <div className="rq-day-item">
                  <span className="rq-item-icon">🗼</span>
                  <div>
                    <div className="rq-item-name">Tokyo Skytree</div>
                    <div className="rq-item-meta">18:30 · €18</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="rq-card-footer">
            <div>
              <div className="rq-card-label">Totale 5 giorni p.p.</div>
              <div className="rq-card-price">€ 1.240 – 1.680</div>
            </div>
            <Link href="/onboarding" className="rq-card-cta">Crea il tuo →</Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="rq-how">
        <div className="rq-how-inner">
          <div className="rq-section-label">Come funziona</div>
          <h2 className="rq-section-title">
            Da idea a partenza.<br />Senza stress.
          </h2>
          <div className="rq-steps">
            <div className="rq-step">
              <div className="rq-step-icon">🧭</div>
              <div className="rq-step-num">01</div>
              <h3 className="rq-step-title">Dimmi chi sei</h3>
              <p className="rq-step-desc">Budget, interessi, con chi viaggi, che ritmo vuoi. 60 secondi e l&apos;AI ti conosce.</p>
            </div>
            <div className="rq-step-arrow">→</div>
            <div className="rq-step">
              <div className="rq-step-icon">✨</div>
              <div className="rq-step-num">02</div>
              <h3 className="rq-step-title">L&apos;AI costruisce tutto</h3>
              <p className="rq-step-desc">Itinerario giornaliero, hotel, esperienze, costi reali. Personalizzato solo per te.</p>
            </div>
            <div className="rq-step-arrow">→</div>
            <div className="rq-step">
              <div className="rq-step-icon">🛫</div>
              <div className="rq-step-num">03</div>
              <h3 className="rq-step-title">Prenota e parti</h3>
              <p className="rq-step-desc">Un click per confermare tutto. L&apos;AI ti segue anche durante il viaggio.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY ROAMIQ ── */}
      <section className="rq-why">
        <div className="rq-why-inner">
          <div className="rq-why-text">
            <div className="rq-section-label">Perché ROAMIQ</div>
            <h2 className="rq-section-title">
              Smetti di perdere<br />ore su booking,<br />mappe e guide.
            </h2>
            <p className="rq-why-sub">
              Il viaggiatore medio apre 6 app diverse per organizzare un viaggio.
              ROAMIQ le sostituisce tutte — con un&apos;unica intelligenza che conosce
              i tuoi gusti e ottimizza ogni dettaglio.
            </p>
            <Link href="/onboarding" className="rq-btn-outline">
              Provalo gratis →
            </Link>
          </div>
          <div className="rq-why-cards">
            <div className="rq-why-card rq-why-card-dark">
              <div className="rq-why-card-icon">🤖</div>
              <h3>AI che ti capisce</h3>
              <p>Non suggerisce i soliti posti. Apprende i tuoi gusti e migliora ad ogni viaggio.</p>
            </div>
            <div className="rq-why-card">
              <div className="rq-why-card-icon">💶</div>
              <h3>Costi reali</h3>
              <p>Ogni attività è costificata. Sai esattamente quanto spendi, prima di partire.</p>
            </div>
            <div className="rq-why-card">
              <div className="rq-why-card-icon">👥</div>
              <h3>Perfetto in gruppo</h3>
              <p>Viaggi con amici o famiglia? L&apos;AI bilancia le preferenze di tutti e mette d&apos;accordo.</p>
            </div>
            <div className="rq-why-card rq-why-card-accent">
              <div className="rq-why-card-icon">⚡</div>
              <h3>Re-plan istantaneo</h3>
              <p>Piove? Museo chiuso? L&apos;AI riorganizza l&apos;intera giornata in secondi.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF / DESTINATIONS ── */}
      <section className="rq-destinations-section">
        <div className="rq-dest-inner">
          <div className="rq-section-label">Dove puoi andare</div>
          <h2 className="rq-section-title">Un AI, il mondo intero.</h2>
          <div className="rq-dest-grid">
            {[
              { emoji: "🇯🇵", city: "Tokyo",        tag: "Cultura & Cibo" },
              { emoji: "🇵🇹", city: "Lisbona",      tag: "Romantica" },
              { emoji: "🇲🇦", city: "Marrakech",    tag: "Avventura" },
              { emoji: "🇦🇷", city: "Buenos Aires", tag: "Vivace" },
              { emoji: "🇮🇸", city: "Reykjavik",    tag: "Natura" },
              { emoji: "🇹🇭", city: "Bangkok",      tag: "Street food" },
            ].map((d) => (
              <Link href="/onboarding" key={d.city} className="rq-dest-card">
                <div className="rq-dest-flag">{d.emoji}</div>
                <div className="rq-dest-city">{d.city}</div>
                <div className="rq-dest-tag">{d.tag}</div>
                <div className="rq-dest-arrow">→</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="rq-cta">
        <div className="rq-cta-inner">
          <h2 className="rq-cta-title">
            Il prossimo viaggio<br />inizia qui.
          </h2>
          <p className="rq-cta-sub">
            Gratis. Nessuna carta richiesta. Pronto in 30 secondi.
          </p>
          <Link href="/onboarding" className="rq-btn-hero rq-btn-hero-large">
            Crea il mio itinerario AI
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="rq-footer">
        <div className="rq-footer-inner">
          <div className="rq-footer-logo">ROAM<span>IQ</span></div>
          <div className="rq-footer-links">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Termini</Link>
            <a href="mailto:hello@roamiq.com">Contatti</a>
          </div>
          <div className="rq-footer-copy">© 2026 ROAMIQ</div>
        </div>
      </footer>
    </>
  );
}
