"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase-browser";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase gestisce il token dall'URL automaticamente via onAuthStateChange
    const supabase = createBrowserClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        // Utente autenticato con token — può reimpostare la password
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Le password non coincidono."); return; }
    if (password.length < 8) { setError("La password deve essere di almeno 8 caratteri."); return; }
    setLoading(true);
    const supabase = createBrowserClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setDone(true);
    setTimeout(() => router.push("/dashboard"), 3000);
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <Link href="/" className="ob-logo" style={{ color: "#fff" }}>ROAM<span style={{ color: "#C4915A" }}>IQ</span></Link>
          <div className="auth-tagline">
            <h2>Nuova<br />password.</h2>
            <p>Scegli una password sicura per proteggere il tuo account.</p>
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-form-wrap">
          {done ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
              <h1 className="auth-form-title">Password aggiornata!</h1>
              <p className="auth-form-sub">Verrai reindirizzato alla dashboard tra pochi secondi...</p>
            </div>
          ) : (
            <>
              <div className="auth-form-header">
                <h1 className="auth-form-title">Nuova password</h1>
                <p className="auth-form-sub">Scegli una password sicura (min. 8 caratteri).</p>
              </div>
              {error && <div className="auth-error">{error}</div>}
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="auth-field">
                  <label className="ob-label">Nuova password</label>
                  <input className="ob-input" type="password" placeholder="Min. 8 caratteri"
                    value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus />
                </div>
                <div className="auth-field">
                  <label className="ob-label">Conferma password</label>
                  <input className="ob-input" type="password" placeholder="Ripeti la password"
                    value={confirm} onChange={(e) => setConfirm(e.target.value)} required
                    style={confirm && confirm !== password ? { borderColor: "#EF4444" } : {}} />
                </div>
                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? <span className="ob-spinner" /> : "Aggiorna password →"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
