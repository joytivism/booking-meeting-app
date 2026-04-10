import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Inter font config
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Real Advertise — Booking Meeting",
  description:
    "Jadwalkan meeting dengan tim Real Advertise secara profesional dan modern.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} font-sans antialiased`}>
      <body>
        {children}
      </body>
    </html>
  );
}
