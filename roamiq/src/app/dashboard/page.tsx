import { supabase } from "../lib/supabase";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function addIdea(formData: FormData) {
  "use server";
  const title = formData.get("title") as string;
  if (!title) return;

  await supabase.from("ideas").insert([{ title }]);
  revalidatePath("/dashboard");
}

export default async function Dashboard() {
  const { data: ideas } = await supabase
    .from("ideas")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1>Your Travel Ideas</h1>

      <div className="card">
        <form action={addIdea}>
          <input
            name="title"
            placeholder="Weekend a Barcellona con budget 600€"
            required
            style={{ marginRight: "10px" }}
          />
          <button className="primary-btn">Generate</button>
        </form>
      </div>

      {ideas?.map((idea) => (
        <div key={idea.id} className="card">
          <strong>{idea.title}</strong>
          <div style={{ fontSize: "12px", color: "#999" }}>
            {new Date(idea.created_at).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
