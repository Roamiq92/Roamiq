return (
  <div>
    <h1>Build your next trip with AI</h1>
    <h2>Insert a travel idea and let Roamiq evolve it</h2>

    <form action={addIdea} style={{ marginBottom: "30px" }}>
      <input
        name="title"
        placeholder="Es: Weekend a Lisbona low cost"
        required
        style={{ marginRight: "10px" }}
      />
      <button type="submit">Generate</button>
    </form>

    {ideas?.map((idea) => (
      <div key={idea.id} className="card">
        <strong>{idea.title}</strong>
        <div style={{ fontSize: "12px", color: "#999", marginTop: "6px" }}>
          Created at: {new Date(idea.created_at).toLocaleString()}
        </div>
      </div>
    ))}
  </div>
);
