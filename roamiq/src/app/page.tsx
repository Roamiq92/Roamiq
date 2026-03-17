import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* ── NAV ── */}
      <nav>
        <Link href="/" className="logo">
          ROAM<span>IQ</span>
        </Link>
        <ul>
          <li><a href="#come-funziona">Come funziona</a></li>
          <li><a href="#features">Funzionalità</a></li>
          <li><a href="#pricing">Prezzi</a></li>
          <li><a href="#cities">Città</a></li>
        </ul>
        <Link href="/onboarding" className="nav-cta">
          Prova gratis →
        </Link>
      </nav>

      {/* ── HERO ── */}
      <div className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="dot" />
            AI-Powered Travel OS
          </div>
          <h1>
            Pianifica il tuo viaggio in{" "}
            <em>30 secondi</em>, non in 4 ore
          </h1>
          <p className="hero-sub">
            ROAMIQ conosce i tuoi gusti, costruisce l&apos;itinerario perfetto,
            coordina volo, hotel ed esperienze — e ti guida in tempo reale mentre
            sei in città.
          </p>
          <div className="hero-actions">
            <Link href="/onboarding" className="btn-primary">
              🚀 Crea il tuo viaggio gratis
            </Link>
            <a href="#come-funziona" className="btn-ghost">
              Scopri come funziona ↓
            </a>
          </div>
          <div className="hero-trust">
            <div className="trust-item">
              <div className="trust-icon">
                <svg fill="none" viewBox="0 0 12 12" width="11" height="11">
                  <path d="M2 6l3 3 5-5" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              Nessuna carta richiesta
            </div>
            <div className="trust-sep" />
            <div className="trust-item">
              <div className="trust-icon">
                <svg fill="none" viewBox="0 0 12 12" width="11" height="11">
                  <path d="M2 6l3 3 5-5" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              Piano gratuito per sempre
            </div>
            <div className="trust-sep" />
            <div className="trust-item">
              <div className="trust-icon">
                <svg fill="none" viewBox="0 0 12 12" width="11" height="11">
                  <path d="M2 6l3 3 5-5" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              Pronto in 30 secondi
            </div>
          </div>
        </div>

        {/* App mockup */}
        <div className="hero-visual">
          <div className="float-card float-ai">
            <span className="ai-dot" />
            <span className="ai-text">AI sta ottimizzando l&apos;itinerario...</span>
          </div>
          <div className="app-mockup">
            <div className="mockup-top">
              <div className="mockup-dots">
                <span className="d1" />
                <span className="d2" />
                <span className="d3" />
              </div>
              <div className="mockup-bar">
                <span>roamiq.com/itinerary/barcellona-3d</span>
              </div>
            </div>
            <div className="mockup-body">
              <div className="route-header">
                <span className="route-title">🏙️ Barcellona · 3 giorni</span>
                <span className="route-badge">✨ AI Generato</span>
              </div>
              <div className="day-card">
                <div className="day-label">Giorno 1 · Arrivo &amp; Gaudí</div>
                <div className="day-activities">
                  <div className="activity">
                    <div className="activity-icon ai-bg">🏛️</div>
                    <div className="activity-info">
                      <div className="activity-name">Sagrada Família</div>
                      <div className="activity-time">09:30 · 2h · Skip-the-line</div>
                    </div>
                    <div className="activity-price">€26</div>
                  </div>
                  <div className="activity">
                    <div className="activity-icon am-bg">🍽️</div>
                    <div className="activity-info">
                      <div className="activity-name">Tapas al Barceloneta</div>
                      <div className="activity-time">13:00 · Su scelta AI</div>
                    </div>
                    <div className="activity-price">€18</div>
                  </div>
                  <div className="activity">
                    <div className="activity-icon ab-bg">🌅</div>
                    <div className="activity-info">
                      <div className="activity-name">Park Güell al tramonto</div>
                      <div className="activity-time">18:30 · 1.5h</div>
                    </div>
                    <div className="activity-price">€10</div>
                  </div>
                </div>
              </div>
              <div className="day-card" style={{ background: "#EFF4FF" }}>
                <div className="day-label" style={{ color: "#1d4ed8" }}>
                  Giorno 2 · Gotico &amp; Mare
                </div>
                <div className="day-activities">
                  <div className="activity">
                    <div className="activity-icon ai-bg">🏰</div>
                    <div className="activity-info">
                      <div className="activity-name">Barrio Gótico walk</div>
                      <div className="activity-time">10:00 · Guida audio AR</div>
                    </div>
                    <div className="activity-price">Free</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mockup-footer">
              <div>
                <div className="total-label">Totale stimato 3 giorni</div>
                <div className="total-price">€ 487 p.p.</div>
              </div>
              <button className="book-btn">Prenota tutto →</button>
            </div>
          </div>
          <div className="float-card float-save">
            <div className="s-label">Risparmio AI vs fai-da-te</div>
            <div className="s-val">- €124 🎉</div>
          </div>
        </div>
      </div>

      {/* ── PROBLEM ── */}
      <section className="section-wrap problem-section">
        <div className="section-inner">
          <div className="section-label">Il problema</div>
          <h2>Quante app apri per organizzare un viaggio?</h2>
          <p className="section-sub">
            Il viaggiatore medio usa 4–6 app diverse, perde ore di ricerca, e
            finisce con esperienze standardizzate che non rispecchiano chi è
            davvero.
          </p>
          <div className="apps-grid">
            {[
              { icon: "✈️", bg: "#FFEEF0", label: "Voli",       sub: "Skyscanner, Kayak..." },
              { icon: "🏨", bg: "#EEF4FF", label: "Hotel",      sub: "Booking, Airbnb..." },
              { icon: "🗺️", bg: "#EEFFF4", label: "Mappe",      sub: "Google Maps..." },
              { icon: "🎭", bg: "#FFF8EE", label: "Esperienze",  sub: "Viator, GetYourGuide..." },
              { icon: "📝", bg: "#F4EEFF", label: "Note & Itinerari", sub: "Notion, Notes..." },
              { icon: "💬", bg: "#EEFFFF", label: "Gruppi & Decisioni", sub: "WhatsApp, poll..." },
            ].map((app) => (
              <div key={app.label} className="app-pill">
                <div className="app-icon" style={{ background: app.bg }}>
                  {app.icon}
                </div>
                <div>
                  <div className="app-pill-text">{app.label}</div>
                  <div className="app-pill-sub">{app.sub}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="vs-card">
            <div className="vs-icon">🧠</div>
            <p className="vs-text">
              Il mercato offre{" "}
              <strong>infinite soluzioni</strong>, ma{" "}
              <strong>nessuna coordina l&apos;intero viaggio</strong>. ROAMIQ è il
              primo sistema che collega tutto in un&apos;unica intelligenza.
            </p>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="section-wrap" id="features">
        <div className="section-inner">
          <div className="section-label">Le funzionalità</div>
          <h2>
            L&apos;AI non è un chatbot.
            <br />
            È il cervello del tuo viaggio.
          </h2>
          <p className="section-sub">
            Quattro tecnologie AI native che lavorano insieme, non aggiunte in
            cima a un sistema vecchio.
          </p>
          <div className="features-grid">
            <div className="feat-card featured">
              <div className="feat-icon-wrap" style={{ background: "rgba(37,99,235,.3)" }}>
                🤖
              </div>
              <div className="feat-title">Onboarding Intelligente</div>
              <p className="feat-desc">
                Impara chi sei: età, interessi, budget, ritmo, con chi viaggi.
                Genera un itinerario su misura in 30 secondi, costificato e
                prenotabile subito.
              </p>
            </div>
            <div className="feat-card">
              <div className="feat-icon-wrap" style={{ background: "#EFF4FF" }}>👥</div>
              <div className="feat-title">Group Decision AI</div>
              <p className="feat-desc">
                Risolve i conflitti nei viaggi di gruppo. Analizza le preferenze
                di tutti e propone soluzioni che mettono d&apos;accordo coppie,
                amici e famiglie.
              </p>
            </div>
            <div className="feat-card">
              <div className="feat-icon-wrap" style={{ background: "#ECFEFF" }}>⚡</div>
              <div className="feat-title">Dynamic Booking</div>
              <p className="feat-desc">
                Ottimizza prezzo, tempi e disponibilità in tempo reale. Un click
                per prenotare volo, hotel ed esperienze in modo coordinato.
              </p>
            </div>
            <div className="feat-card">
              <div className="feat-icon-wrap" style={{ background: "#FFFBEB" }}>🎧</div>
              <div className="feat-title">Local Knowledge &amp; AR</div>
              <p className="feat-desc">
                Guida audio contestuale mentre cammini. Suggerimenti autentici da
                guide locali certificate, adattivi al tuo ritmo e ai tuoi
                interessi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section-wrap how-section" id="come-funziona">
        <div className="section-inner" style={{ textAlign: "center" }}>
          <div className="section-label">Come funziona</div>
          <h2>
            Da zero a viaggio prenotato
            <br />
            in meno di 2 minuti
          </h2>
          <div className="steps-grid">
            {[
              {
                n: "1", cls: "s1",
                title: "Dì chi sei",
                desc: "Onboarding di 60 secondi: destinazione, date, budget, interessi e con chi viaggi. L'AI costruisce il tuo profilo.",
              },
              {
                n: "2", cls: "s2",
                title: "Ricevi l'itinerario",
                desc: "ROAMIQ genera un itinerario completo e costificato, con alternative personalizzate su ogni attività.",
              },
              {
                n: "3", cls: "s3",
                title: "Prenota e parti",
                desc: "Conferma tutto con un click. L'AI ti segue durante il viaggio con re-planning istantaneo se qualcosa cambia.",
              },
            ].map((s) => (
              <div key={s.n} className="step">
                <div className={`step-num ${s.cls}`}>{s.n}</div>
                <div className="step-title">{s.title}</div>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="section-wrap stats-section">
        <div className="section-inner">
          <div style={{ textAlign: "center" }}>
            <div className="section-label">Il mercato</div>
            <h2>Un&apos;opportunità da 9.000 miliardi</h2>
          </div>
          <div className="stats-grid">
            {[
              { num: "1,4", unit: "B", label: "Viaggiatori internazionali ogni anno" },
              { num: "$9",  unit: "T", label: "Spesa globale turismo, ~10% del PIL mondiale" },
              { num: "400", unit: "M", label: "Viaggi business all'anno, segmento ad alto valore" },
              { num: "15",  unit: "%", label: "dei viaggiatori genera oltre il 50% di tutti i viaggi" },
            ].map((s) => (
              <div key={s.unit + s.num} className="stat-card">
                <div className="stat-num">{s.num}<span>{s.unit}</span></div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CITIES ── */}
      <section className="section-wrap cities-section" id="cities">
        <div className="section-inner">
          <div className="section-label">Go to market</div>
          <h2>Partenza da 5 città europee</h2>
          <p className="section-sub">
            Focus iniziale su city break e viaggi di coppia, con espansione rapida
            a gruppi e viaggi business.
          </p>
          <div className="cities-row">
            {[
              { flag: "🇪🇸", name: "Barcellona" },
              { flag: "🇮🇹", name: "Roma" },
              { flag: "🇫🇷", name: "Parigi" },
              { flag: "🇵🇹", name: "Lisbona" },
              { flag: "🇳🇱", name: "Amsterdam" },
            ].map((c) => (
              <div key={c.name} className="city-chip">
                <span className="flag">{c.flag}</span>
                {c.name}
              </div>
            ))}
            <div className="city-coming">+ altre città in arrivo 🌍</div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="section-wrap" id="pricing">
        <div className="section-inner">
          <div style={{ textAlign: "center" }}>
            <div className="section-label">Prezzi</div>
            <h2>Inizia gratis, scala quando vuoi</h2>
            <p className="section-sub" style={{ margin: "0 auto 1rem" }}>
              Nessuna carta di credito richiesta. Upgrade quando sei pronto.
            </p>
          </div>
          <div className="pricing-grid">
            {/* FREE */}
            <div className="price-card">
              <div className="plan-name">Free</div>
              <div className="plan-price"><sup>€</sup>0 <span className="mo">/mese</span></div>
              <p className="plan-desc">Perfetto per iniziare e scoprire ROAMIQ.</p>
              <ul className="plan-features">
                <li><span className="check">✓</span> 3 itinerari AI al mese</li>
                <li><span className="check">✓</span> Mappe e navigazione base</li>
                <li><span className="check">✓</span> Prenotazione voli e hotel</li>
                <li><span className="cross">✗</span> Concierge AI dedicato</li>
                <li><span className="cross">✗</span> Modalità offline</li>
                <li><span className="cross">✗</span> Guide audio AR</li>
              </ul>
              <Link href="/register" className="plan-btn outline">
                Inizia gratis
              </Link>
            </div>
            {/* PREMIUM */}
            <div className="price-card popular">
              <div className="popular-badge">⭐ PIÙ SCELTO</div>
              <div className="plan-name">Premium</div>
              <div className="plan-price"><sup>€</sup>14 <span className="mo">/mese</span></div>
              <p className="plan-desc">Per il viaggiatore che vuole il meglio, sempre.</p>
              <ul className="plan-features">
                <li><span className="check">✓</span> Itinerari illimitati</li>
                <li><span className="check">✓</span> Concierge AI 24/7</li>
                <li><span className="check">✓</span> Modalità offline completa</li>
                <li><span className="check">✓</span> Guide audio AR</li>
                <li><span className="check">✓</span> Re-planning istantaneo</li>
                <li><span className="check">✓</span> Group Decision AI</li>
              </ul>
              <Link href="/register?plan=premium" className="plan-btn filled">
                Inizia il trial gratuito
              </Link>
            </div>
            {/* BUSINESS */}
            <div className="price-card">
              <div className="plan-name">Business</div>
              <div className="plan-price" style={{ fontSize: "1.5rem" }}>Su misura</div>
              <p className="plan-desc">Per tour operator, DMO, hotel e agenzie di viaggio.</p>
              <ul className="plan-features">
                <li><span className="check">✓</span> API &amp; white label</li>
                <li><span className="check">✓</span> Dashboard analytics</li>
                <li><span className="check">✓</span> Integrazione booking system</li>
                <li><span className="check">✓</span> SLA garantito</li>
                <li><span className="check">✓</span> Supporto dedicato</li>
                <li><span className="check">✓</span> Revenue sharing guide locali</li>
              </ul>
              <a href="mailto:hello@roamiq.com" className="plan-btn dark">
                Contattaci
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="section-wrap cta-section">
        <div className="section-inner">
          <div className="section-label" style={{ color: "#60A5FA" }}>Inizia ora</div>
          <h2>
            Il modo in cui il mondo viaggia
            <br />
            sta per cambiare.
          </h2>
          <p className="section-sub">
            ROAMIQ può partire da una città, ma è progettato per diventare la
            piattaforma globale del viaggio intelligente.
          </p>
          <div className="cta-actions">
            <Link href="/onboarding" className="btn-white">
              🚀 Crea il tuo primo viaggio
            </Link>
            <Link href="/register" className="btn-outline-white">
              Registrati gratis
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="footer-inner">
          <div className="footer-logo">ROAM<span>IQ</span></div>
          <div className="footer-links">
            <a href="#">Chi siamo</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Termini di servizio</a>
            <a href="#">Blog</a>
            <a href="mailto:hello@roamiq.com">Contatti</a>
          </div>
          <div className="footer-copy">© 2026 ROAMIQ · The AI‑Powered Travel OS</div>
        </div>
      </footer>
    </>
  );
}
