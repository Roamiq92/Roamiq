import "./globals.css";
import Image from "next/image";
import Link from "next/link";

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
        <nav className="navbar">
          <div className="nav-left">
            <Image src="/Logo.png" alt="Roamiq" width={150} height={40} />
          </div>
          <div className="nav-right">
            <Link href="/">Home</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/about">About</Link>
          </div>
        </nav>

        <main className="container">{children}</main>

        <footer className="footer">
          © {new Date().getFullYear()} Roamiq — AI Travel Agents
        </footer>
      </body>
    </html>
  );
}
