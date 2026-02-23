"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/login");
      } else {
        setUser(data.user);
      }

      setLoading(false);
    };

    checkUser();
  }, []);

  if (loading) {
    return <div style={{ padding: 40 }}>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ fontSize: 32, marginBottom: 20 }}>
        Dashboard
      </h1>

      <p style={{ color: "#64748b", marginBottom: 30 }}>
        Benvenuto {user.email}
      </p>

      <button
        onClick={async () => {
          await supabase.auth.signOut();
          router.push("/");
        }}
        style={{
          padding: "12px 20px",
          borderRadius: 10,
          border: "none",
          background:
            "linear-gradient(to right, #6366f1, #8b5cf6)",
          color: "white",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
}
