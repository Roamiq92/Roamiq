import { supabase } from "./lib/supabase";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function addIdea(formData: FormData) {
  "use server";

  const title = formData.get("title") as string;

  if (!title) return;

  await supabase.from("ideas").insert([{ title }]);
  revalidatePath("/");
}

export default async function Page() {
  const { data: ideas } = await supabase
    .from("ideas")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      {/* HERO */}
      <section style={{ marginBottom: "60px" }}>
        <h1 style={{ fontSize: "42px", marginBottom: "20px" }}>
          AI Travel Planner
        </h1>

        <p style={{ fontSize: "18px", color: "#666", maxWidth: "600px" }}>
          Describe your dream trip and let Roamiq transform it into a structured
          travel plan powered by AI agents.
        </p>
      </section>

      {/* INPUT */}
      <section style={{ marginBottom: "50px" }}>
        <div className="card" style={{ padding: "30px" }}>
          <form action={addIdea}>
            <input
              name="title"
              placeholder="Es: Weekend romantico a Parigi con budget 800€"
              required
              style={{ marginRight: "10px", width: "60%" }}
            />
            <button type="submit">Generate Plan</button>
          </form>
        </div>
      </section>

      {/* IDEAS */}
      <section>
        <h2 style={{ marginBottom: "20px" }}>Your Travel Ideas</h2>

        {ideas?.length === 0 && (
          <div style={{ color: "#999" }}>
            No travel ideas yet. Start creating one.
          </div>
        )}

        {ideas?.map((idea) => (
          <div key={idea.id} className="card">
            <strong>{idea.title}</strong>
            <div
              style={{
                fontSize: "12px",
                color: "#999",
                marginTop: "6px",
              }}
            >
              Created at: {new Date(idea.created_at).toLocaleString()}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
