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
        <nav
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "30px 60px",
            background: "white",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
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

          <div
            style={{
              display: "flex",
              gap: "40px",
              fontSize: "16px",
              fontWeight: 500,
            }}
          >
            <Link
              href="/"
              style={{
                color: "#0f172a",
                textDecoration: "none",
              }}
            >
              Home
            </Link>

            <Link
              href="/dashboard"
              style={{
                color: "#0f172a",
                textDecoration: "none",
              }}
            >
              Dashboard
            </Link>

            <Link
              href="/login"
              style={{
                color: "#0f172a",
                textDecoration: "none",
              }}
            >
              Login
            </Link>
          </div>
        </nav>

        <main
          style={{
            maxWidth: "1200px",
            margin: "80px auto",
            padding: "0 30px",
          }}
        >
          {children}
        </main>

        <footer
          style={{
            textAlign: "center",
            padding: "60px 20px",
            marginTop: "120px",
            borderTop: "1px solid #e2e8f0",
            color: "#64748b",
            fontSize: "14px",
          }}
        >
          © {new Date().getFullYear()} Roamiq — AI Travel Agents
        </footer>
      </body>
    </html>
  );
}
