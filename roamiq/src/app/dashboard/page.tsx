"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/login");
      } else {
        setUser(data.user);
      }
    };

    getUser();
  }, []);

  if (!user) return <p style={{ padding: 40 }}>Loading...</p>;

  return (
    <div style={{ padding: 40 }}>
      <h1>Dashboard</h1>
      <p>Benvenuto {user.email}</p>

      <button
        onClick={async () => {
          await supabase.auth.signOut();
          router.push("/");
        }}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          borderRadius: 8,
          background: "linear-gradient(to right, #6366f1, #8b5cf6)",
          color: "white",
          border: "none",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Logout
      </button>
    </div>
  );
}
