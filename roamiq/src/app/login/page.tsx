"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: any) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    if (data.user) {
      router.push("/dashboard");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 20% 30%, #6366f1 0%, transparent 40%), radial-gradient(circle at 80% 70%, #8b5cf6 0%, transparent 40%), #f8fafc",
      }}
    >
      <div
        style={{
          width: 420,
          background: "white",
          padding: 40,
          borderRadius: 20,
          boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
        }}
      >
        <h1
          style={{
            fontSize: 32,
            marginBottom: 10,
            fontWeight: 700,
            background: "linear-gradient(to right, #6366f1, #8b5cf6)",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          Welcome Back
        </h1>

        <p style={{ marginBottom: 30, color: "#64748b" }}>
          Accedi al tuo spazio personale ROAMIQ
        </p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: 14,
              marginBottom: 15,
              borderRadius: 10,
              border: "1px solid #e2e8f0",
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: 14,
              marginBottom: 20,
              borderRadius: 10,
              border: "1px solid #e2e8f0",
            }}
          />

          <button
            type="submit"
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 10,
              border: "none",
              background:
                "linear-gradient(to right, #6366f1, #8b5cf6)",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
