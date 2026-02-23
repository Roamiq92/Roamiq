import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <section className="hero">
        <div className="hero-text">
          <div className="badge">AI-Powered Travel Agents</div>

          <h1>
            Plan smarter.
            <br />
            Travel better.
          </h1>

          <p>
            Roamiq transforms simple travel ideas into structured,
            optimized, AI-generated travel plans powered by intelligent agents.
          </p>

          <div className="hero-buttons">
            <Link href="/dashboard">
              <button className="primary-btn">
                Start Planning
              </button>
            </Link>

            <Link href="/about">
              <button className="secondary-btn">
                Learn More
              </button>
            </Link>
          </div>
        </div>

        <div className="hero-image">
          <Image
            src="/globe.svg"
            alt="Travel Illustration"
            width={500}
            height={400}
          />
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <h3>🧠 AI Agents</h3>
          <p>Autonomous planning agents that design your entire trip.</p>
        </div>

        <div className="feature-card">
          <h3>⚡ Instant Planning</h3>
          <p>From idea to structured itinerary in seconds.</p>
        </div>

        <div className="feature-card">
          <h3>🌍 Optimized Experiences</h3>
          <p>Budget, logistics, timing — everything calculated.</p>
        </div>
      </section>
    </div>
  );
}
