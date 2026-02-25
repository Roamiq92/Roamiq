"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabaseBrowser } from "../lib/supabase-browser";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validazione
    if (formData.password !== formData.confirmPassword) {
      setError("Le password non coincidono");
      return;
    }

    if (formData.password.length < 6) {
      setError("La password deve avere almeno 6 caratteri");
      return;
    }

    setLoading(true);

    const { data, error } = await supabaseBrowser.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.name,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data.user) {
      // Redirect to onboarding after successful registration
      router.push("/onboarding");
    }
  };

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center px-6 py-12">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <Image 
              src="/Logo.png" 
              alt="ROAMIQ" 
              width={150} 
              height={45}
              className="h-12 w-auto mx-auto mb-4"
            />
          </Link>
          <h1 className="text-3xl font-bold mb-2">Crea il tuo Account 🚀</h1>
          <p className="text-gray-400">Inizia a viaggiare in modo intelligente</p>
        </div>

        {/* Form Card */}
        <div className="glass-card">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome completo
              </label>
              <input
                type="text"
                name="name"
                placeholder="Mario Rossi"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="nome@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Minimo 6 caratteri"
                value={formData.password}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Conferma Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Ripeti la password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex items-start gap-2 text-sm text-gray-400">
              <input type="checkbox" required className="mt-1 rounded border-gray-600" />
              <span>
                Accetto i{" "}
                <a href="#" className="text-orange-400 hover:underline">Termini di Servizio</a>
                {" "}e la{" "}
                <a href="#" className="text-orange-400 hover:underline">Privacy Policy</a>
              </span>
            </div>

            <button 
              type="submit" 
              className="btn-primary w-full flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creazione account...
                </>
              ) : (
                "Crea Account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#1a1f35] text-gray-400">oppure</span>
            </div>
          </div>

          {/* Social Login */}
          <button className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 transition">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Registrati con Google
          </button>
        </div>

        {/* Login Link */}
        <p className="text-center mt-6 text-gray-400">
          Hai già un account?{" "}
          <Link href="/login" className="text-orange-400 hover:text-orange-300 font-medium">
            Accedi
          </Link>
        </p>

        {/* Back to Home */}
        <p className="text-center mt-4">
          <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm">
            ← Torna alla Home
          </Link>
        </p>
      </div>
    </div>
  );
}
