import { supabase } from "./lib/supabase";

export const dynamic = "force-dynamic";

async function addIdea(formData: FormData) {
  "use server";

  const title = formData.get("title") as string;

  if (!title) return;

  await supabase.from("ideas").insert([{ title }]);
}

export default async function Page() {
  const { data: ideas } = await supabase
    .from("ideas")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div style={{ padding: "40px" }}>
      <h1>ROAMIQ</h1>

      <form action={addIdea} style={{ marginBottom: "20px" }}>
        <input
          name="title"
          placeholder="Scrivi una nuova idea..."
          style={{ padding: "8px", marginRight: "10px" }}
        />
        <button type="submit">Aggiungi</button>
      </form>

      <h2>Ideas:</h2>

      {ideas?.map((idea) => (
        <div key={idea.id}>
          • {idea.title}
        </div>
      ))}
    </div>
  );
}
