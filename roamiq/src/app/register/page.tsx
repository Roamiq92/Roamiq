"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase-browser";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [agreed, setAgreed]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Le password non coincidono.");
      return;
    }
    if (password.length < 8) {
      setError("La password deve essere di almeno 8 caratteri.");
      return;
    }
    if (!agreed) {
      setError("Devi accettare i Termini di servizio per continuare.");
      return;
    }

    setLoading(true);
    const supabase = createBrowserClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Redirect to onboarding to start first trip
    router.push("/onboarding");
  };

  const handleGoogle = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/onboarding` },
    });
  };

  const strength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : 3;

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <Link href="/" className="ob-logo" style={{ color: "#fff" }}>
            ROAM<span style={{ color: "#60A5FA" }}>IQ</span>
          </Link>
          <div className="auth-tagline">
            <h2>Viaggia meglio,<br />a partire da oggi.</h2>
            <p>Crea il tuo account gratis e pianifica il primo viaggio AI in meno di 2 minuti.</p>
          </div>
          <div className="auth-features">
            {[
              { icon: "🚀", text: "Primo itinerario in 30 secondi" },
              { icon: "💶", text: "Piano gratuito, sempre" },
              { icon: "🔒", text: "I tuoi dati sono al sicuro" },
            ].map((f) => (
              <div key={f.text} className="auth-feature-item">
                <span>{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h1 className="auth-form-title">Crea il tuo account</h1>
            <p className="auth-form-sub">
              Hai già un account?{" "}
              <Link href="/login" className="auth-link">Accedi</Link>
            </p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleRegister} className="auth-form">
            <div className="auth-field">
              <label className="ob-label">Nome completo</label>
              <input
                className="ob-input"
                type="text"
                placeholder="Mario Rossi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
            <div className="auth-field">
              <label className="ob-label">Email</label>
              <input
                className="ob-input"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="auth-field">
              <label className="ob-label">Password</label>
              <input
                className="ob-input"
                type="password"
                placeholder="Min. 8 caratteri"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              {password.length > 0 && (
                <div className="auth-strength">
                  <div className="auth-strength-bar">
                    {[1,2,3].map((i) => (
                      <div
                        key={i}
                        className={`auth-strength-seg ${strength >= i ? `s${strength}` : ""}`}
                      />
                    ))}
                  </div>
                  <span className="auth-strength-label">
                    {["", "Debole", "Buona", "Ottima"][strength]}
                  </span>
                </div>
              )}
            </div>
            <div className="auth-field">
              <label className="ob-label">Conferma password</label>
              <input
                className="ob-input"
                type="password"
                placeholder="Ripeti la password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                style={confirm && confirm !== password ? { borderColor: "#EF4444" } : {}}
              />
            </div>

            <label className="auth-checkbox">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span>
                Accetto i{" "}
                <Link href="/terms" className="auth-link">Termini di servizio</Link>
                {" "}e la{" "}
                <Link href="/privacy" className="auth-link">Privacy Policy</Link>
              </span>
            </label>

            <button type="submit" className="auth-submit" disabled={loading || !agreed}>
              {loading ? <span className="ob-spinner" /> : "Crea account →"}
            </button>
          </form>

          <div className="auth-divider"><span>oppure</span></div>

          <button className="auth-google" onClick={handleGoogle}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Registrati con Google
          </button>
        </div>
      </div>
    </div>
  );
}
