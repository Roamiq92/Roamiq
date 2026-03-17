"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createBrowserClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("Email o password non corretti. Riprova.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  const handleGoogle = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <Link href="/" className="ob-logo" style={{ color: "#fff" }}>
            ROAM<span style={{ color: "#60A5FA" }}>IQ</span>
          </Link>
          <div className="auth-tagline">
            <h2>Il tuo viaggio,<br />ti aspetta.</h2>
            <p>Accedi e ritrova tutti i tuoi itinerari AI, prenotazioni e preferenze in un unico posto.</p>
          </div>
          <div className="auth-features">
            {[
              { icon: "🗺️", text: "Tutti i tuoi itinerari salvati" },
              { icon: "⚡", text: "Re-planning istantaneo" },
              { icon: "🎧", text: "Guida AR durante il viaggio" },
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
            <h1 className="auth-form-title">Bentornato</h1>
            <p className="auth-form-sub">
              Non hai un account?{" "}
              <Link href="/register" className="auth-link">Registrati gratis</Link>
            </p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleLogin} className="auth-form">
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
              <div className="auth-label-row">
                <label className="ob-label">Password</label>
                <Link href="/forgot-password" className="auth-forgot">Password dimenticata?</Link>
              </div>
              <input
                className="ob-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <span className="ob-spinner" /> : "Accedi →"}
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
            Continua con Google
          </button>

          <p className="auth-terms">
            Accedendo accetti i nostri{" "}
            <Link href="/terms" className="auth-link">Termini di servizio</Link>{" "}
            e la{" "}
            <Link href="/privacy" className="auth-link">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
