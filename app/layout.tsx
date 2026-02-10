import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
const siteUrl =
  process.env.NEXT_PUBLIC_URL ??
  (process.env.NEXT_PUBLIC_URL ? `https://${process.env.NEXT_PUBLIC_URL}` : "http://localhost:3000");

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ogImage = `${siteUrl}/Chat-pilot-metdata.png`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  applicationName: "Chat Pilot",

  title: {
    default: "Chat Pilot – Build Reliable AI Assistants",
    template: "%s | Chat Pilot",
  },

  description:
    "Chat Pilot lets you turn your knowledge, tools, and workflows into reliable AI assistants with analytics and control.",

  keywords: [
    "Chat Pilot",
    "AI agents",
    "AI assistants",
    "customer support AI",
    "knowledge base AI",
    "chat widget",
    "AI analytics",
  ],

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

  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Chat Pilot",
    title: "Chat Pilot – Build Reliable AI Assistants",
    description:
      "Turn your knowledge and tools into reliable AI assistants with Chat Pilot.",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Chat Pilot – AI Assistants Platform",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: "@chatpilot", // optional
    title: "Chat Pilot – Build Reliable AI Assistants",
    description:
      "Turn your knowledge and tools into reliable AI assistants with Chat Pilot.",
    images: [ogImage],
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: ogImage, type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/favicon.ico"],
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
        {/* <script
          src="http://localhost:3000/widget.js"
          data-bot-id="4eba205e-7424-40fe-9b46-66f386c08773"
          defer
        ></script> */}
        <script
          src="http://localhost:3000/widget.js"
          data-bot-id="38fcdfb6-a8b6-44f4-89a2-3c0116df8816"
          data-base-url="http://localhost:3000"
          data-launcher-surface="liquid"
          data-panel-surface="solid"
          defer
        ></script>
        <meta name="google-site-verification" content="NyaInzo49We9F1XvJlyGk4nKfW4LcdAwBp9iOogBm0A" />
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
