import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <section className="hero">
        <div className="hero-text">
          <h1>AI Travel Planning Reinvented</h1>
          <p>
            Roamiq uses intelligent agents to transform simple ideas into
            structured, optimized travel experiences.
          </p>
          <Link href="/dashboard">
            <button className="primary-btn">
              Start Planning
            </button>
          </Link>
        </div>

        <Image
          src="/globe.svg"
          alt="Travel Illustration"
          width={450}
          height={350}
        />
      </section>
    </div>
  );
}
