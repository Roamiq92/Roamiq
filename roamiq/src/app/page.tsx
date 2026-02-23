import { supabase } from "./lib/supabase";

export default async function Page() {
  const { data, error } = await supabase.from("ideas").select("*");

  return (
    <div style={{ padding: "40px" }}>
      <h1>ROAMIQ DEBUG</h1>

      <pre>{JSON.stringify({ data, error }, null, 2)}</pre>
    </div>
  );
}
