import { supabase } from "./lib/supabase";

export const dynamic = "force-dynamic";

export default async function Page() {
  const { data: ideas, error } = await supabase
    .from("ideas")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <div>Errore nel caricamento</div>;
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>ROAMIQ</h1>

      <h2>Ideas:</h2>

      {ideas?.map((idea) => (
        <div key={idea.id}>
          • {idea.title}
        </div>
      ))}
    </div>
  );
}
