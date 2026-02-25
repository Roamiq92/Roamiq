import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "ROAMIQ - Il Tuo Viaggio, Intelligente",
  description: "L'AI-Powered Travel Operating System. Pianifica viaggi personalizzati in pochi minuti.",
  keywords: "viaggi, AI, itinerari, travel planner, intelligenza artificiale",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="scroll-smooth">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
