import "./globals.css";
import Image from "next/image";

export const metadata = {
  title: "Roamiq",
  description: "AI Travel Idea Engine",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body style={{ margin: 0, fontFamily: "Arial, sans-serif" }}>
        <header
          style={{
            display: "flex",
            alignItems: "center",
            padding: "20px 40px",
            borderBottom: "1px solid #eee",
            backgroundColor: "#ffffff",
          }}
        >
          <Image
            src="/Logo.png"
            alt="Roamiq Logo"
            width={180}
            height={50}
            priority
          />
        </header>

        <main
          style={{
            maxWidth: "900px",
            margin: "40px auto",
            padding: "0 20px",
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
