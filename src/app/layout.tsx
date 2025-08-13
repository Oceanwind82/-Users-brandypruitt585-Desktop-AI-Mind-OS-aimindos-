import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from '@vercel/analytics/react';
import "./globals.css";
import CookieConsent from "@/components/CookieConsent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://aimindos.com'),
  title: "AI Mind OS - The Operating System for Dangerous Thinkers",
  description: "Transform your thinking with AI Mind OS. The revolutionary platform that challenges conventional wisdom and unleashes your intellectual potential.",
  keywords: ["AI", "mind training", "critical thinking", "productivity", "learning"],
  authors: [{ name: "Brandy Pruitt", url: "https://aimindos.com" }],
  creator: "Brandy Pruitt",
  openGraph: {
    title: "AI Mind OS - The Operating System for Dangerous Thinkers",
    description: "Transform your thinking with AI Mind OS. Join the revolution of dangerous thinkers.",
    url: "https://aimindos.com",
    siteName: "AI Mind OS",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "AI Mind OS - The Operating System for Dangerous Thinkers",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Mind OS - The Operating System for Dangerous Thinkers",
    description: "Transform your thinking with AI Mind OS. Join the revolution of dangerous thinkers.",
    images: ["/og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  );
}
