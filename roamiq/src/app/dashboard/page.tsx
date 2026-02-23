import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Benvenuto {user.email}</p>
    </div>
  );
}
