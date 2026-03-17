import type { Metadata } from "next";
import { Syne, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ROAMIQ – Il Tuo Viaggio, Intelligente",
  description:
    "ROAMIQ utilizza l'intelligenza artificiale per pianificare, ottimizzare e farti vivere esperienze uniche in ogni città.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className={`${syne.variable} ${jakartaSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
