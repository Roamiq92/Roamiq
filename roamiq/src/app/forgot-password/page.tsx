"use client";

import { useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase-browser";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createBrowserClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSent(true);
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <Link href="/" className="ob-logo" style={{ color: "#fff" }}>ROAM<span style={{ color: "#C4915A" }}>IQ</span></Link>
          <div className="auth-tagline">
            <h2>Recupera<br />il tuo account.</h2>
            <p>Ti inviamo un link sicuro per reimpostare la password.</p>
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-form-wrap">
          {sent ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📧</div>
              <h1 className="auth-form-title">Email inviata!</h1>
              <p className="auth-form-sub" style={{ marginBottom: "2rem" }}>
                Controlla la tua casella email. Hai ricevuto un link per reimpostare la password.<br />
                Controlla anche lo spam.
              </p>
              <Link href="/login" className="auth-link">← Torna al login</Link>
            </div>
          ) : (
            <>
              <div className="auth-form-header">
                <h1 className="auth-form-title">Password dimenticata?</h1>
                <p className="auth-form-sub">Inserisci la tua email e ti mandiamo un link per reimpostarla.</p>
              </div>
              {error && <div className="auth-error">{error}</div>}
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="auth-field">
                  <label className="ob-label">Email</label>
                  <input className="ob-input" type="email" placeholder="name@example.com"
                    value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
                </div>
                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? <span className="ob-spinner" /> : "Invia link di reset →"}
                </button>
              </form>
              <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: ".88rem", color: "var(--muted)" }}>
                Ricordi la password? <Link href="/login" className="auth-link">Accedi</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
