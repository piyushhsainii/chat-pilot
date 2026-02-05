import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Chat Pilot",
  title: {
    default: "Chat Pilot",
    template: "%s | Chat Pilot",
  },
  description: "Turn your knowledge and tools into reliable assistants.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  referrer: "origin-when-cross-origin",
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  keywords: [
    "Chat Pilot",
    "AI agent",
    "customer support",
    "knowledge base",
    "chat widget",
    "analytics",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/chat-pilot-hero.png",
    siteName: "Chat Pilot",
    title: "Chat Pilot",
    description: "Turn your knowledge and tools into reliable assistants.",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Chat Pilot",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chat Pilot",
    description: "Turn your knowledge and tools into reliable assistants.",
    images: ["/api/og"],
  },
  icons: {
    icon: [{ url: "/chat-pilot-hero.png", type: "image/png" }],
    apple: [{ url: "/chat-pilot-hero.png", type: "image/png" }],
    shortcut: ["/chat-pilot-hero.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">

      <head>
        <meta name="google-site-verification" content="NyaInzo49We9F1XvJlyGk4nKfW4LcdAwBp9iOogBm0A" />
        {/* <script
          src="https://chat-pilot-agent.vercel.app/widget.js"
          data-bot-id="38fcdfb6-a8b6-44f4-89a2-3c0116df8816"
          defer
        ></script> */}

      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
