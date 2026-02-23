import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      {/* HERO SECTION */}
      <section
        style={{
          position: "relative",
          padding: "120px 0",
          overflow: "hidden",
        }}
      >
        {/* BACKGROUND GRADIENT MESH */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 20% 20%, #a78bfa 0%, transparent 40%), radial-gradient(circle at 80% 30%, #60a5fa 0%, transparent 40%), radial-gradient(circle at 50% 80%, #f472b6 0%, transparent 40%)",
            opacity: 0.25,
            zIndex: 0,
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "0 30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "60px",
          }}
        >
          {/* TEXT */}
          <div style={{ maxWidth: 550 }}>
            <div
              style={{
                display: "inline-block",
                padding: "8px 16px",
                borderRadius: "20px",
                background: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(8px)",
                fontSize: 14,
                marginBottom: 25,
              }}
            >
              AI Travel Agents
            </div>

            <h1
              style={{
                fontSize: "64px",
                lineHeight: "1.1",
                marginBottom: 25,
                fontWeight: 700,
              }}
            >
              Your entire trip.
              <br />
              Designed by AI.
            </h1>

            <p
              style={{
                fontSize: 20,
                color: "#475569",
                marginBottom: 40,
              }}
            >
              From budget to bookings, itineraries to local restaurants —
              Roamiq builds and manages your travel experience end-to-end.
            </p>

            <div style={{ display: "flex", gap: 20 }}>
              <Link href="/register">
                <button
                  style={{
                    padding: "16px 28px",
                    borderRadius: 12,
                    border: "none",
                    background:
                      "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "white",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: 16,
                  }}
                >
                  Start Planning
                </button>
              </Link>

              <Link href="/dashboard">
                <button
                  style={{
                    padding: "16px 28px",
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    background: "white",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: 16,
                  }}
                >
                  See Demo
                </button>
              </Link>
            </div>
          </div>

          {/* IMAGE */}
          <div>
            <Image
              src="/globe.svg"
              alt="Travel AI"
              width={520}
              height={420}
            />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "80px auto",
          padding: "0 30px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "30px",
        }}
      >
        {[
          {
            title: "Smart Budgeting",
            text: "AI calculates real costs aligned with your budget.",
          },
          {
            title: "Automated Itineraries",
            text: "Day-by-day optimized experiences.",
          },
          {
            title: "Booking Intelligence",
            text: "Flights, hotels and activities — intelligently selected.",
          },
        ].map((feature, i) => (
          <div
            key={i}
            style={{
              padding: 30,
              borderRadius: 20,
              background: "white",
              boxShadow: "0 20px 50px rgba(0,0,0,0.06)",
            }}
          >
            <h3 style={{ fontSize: 20, marginBottom: 15 }}>
              {feature.title}
            </h3>
            <p style={{ color: "#64748b" }}>{feature.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
