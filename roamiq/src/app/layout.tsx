import "./globals.css";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Roamiq",
  description: "AI Travel Planning Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>
        {/* NAVBAR */}
        <nav
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "30px 60px",
            background: "rgba(255,255,255,0.02)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* LOGO GRANDE */}
          <Link href="/">
            <Image
              src="/Logo.png"
              alt="Roamiq"
              width={220}
              height={80}
              style={{
                height: "80px",
                width: "auto",
                cursor: "pointer",
              }}
              priority
            />
          </Link>

          {/* MENU */}
          <div
            style={{
              display: "flex",
              gap: "40px",
              fontSize: "16px",
            }}
          >
            <Link
              href="/"
              style={{ color: "#cbd5e1", textDecoration: "none" }}
            >
              Home
            </Link>

            <Link
              href="/dashboard"
              style={{ color: "#cbd5e1", textDecoration: "none" }}
            >
              Dashboard
            </Link>

            <Link
              href="/login"
              style={{ color: "#cbd5e1", textDecoration: "none" }}
            >
              Login
            </Link>
          </div>
        </nav>

        {/* CONTENUTO */}
        <main
          style={{
            maxWidth: "1200px",
            margin: "80px auto",
            padding: "0 30px",
          }}
        >
          {children}
        </main>

        {/* FOOTER */}
        <footer
          style={{
            textAlign: "center",
            padding: "60px 20px",
            marginTop: "120px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            color: "#94a3b8",
            fontSize: "14px",
          }}
        >
          © {new Date().getFullYear()} Roamiq — AI Travel Agents
        </footer>
      </body>
    </html>
  );
}
