import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkyPair — Pozorovanie oblohy s párovaním zariadení",
  description: "Webová aplikácia na pozorovanie nočnej a dennej oblohy. Spárujte dve zariadenia cez 6‑miestny kód alebo QR kód a zdieľajte obraz kamery so synchronizovanou hviezdou mapou.",
  keywords: ["astronomy", "sky", "WebRTC", "QR", "P2P", "hviezdy", "obloha"],
  authors: [{ name: "SkyPair" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "SkyPair — Pozorovanie oblohy",
    description: "Spárujte zariadenia cez QR kód a zdieľajte obraz oblohy so synchronizovanou mapou hviezd.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sk" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
