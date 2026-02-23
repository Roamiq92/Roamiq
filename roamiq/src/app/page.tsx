import { supabase } from "./lib/supabase";

export default async function Page() {
  const { data: ideas, error } = await supabase
    .from("ideas")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <div>Errore nel caricamento delle idee</div>;
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>ROAMIQ</h1>

      <h2>Ideas:</h2>

      {ideas && ideas.length === 0 && <p>Nessuna idea ancora.</p>}

      {ideas?.map((idea) => (
        <div key={idea.id} style={{ marginBottom: "10px" }}>
          • {idea.title}
        </div>
      ))}
    </div>
  );
}
