import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./components/layout/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lexicon.oredola.dev"),
  title: {
    default: "Oro Lexicon - Yoruba Dictionary | Preserve Yoruba Language",
    template: "%s | Oro Lexicon",
  },
  description: "Oro Lexicon by Oredola Gbenga Augustine — community-driven Yorùbá archive preserving Egba, Ijebu & Standard Yorùbá with accurate tones, IPA and native audio. 1000+ Yoruba words with English meaning, pronunciation & examples.",
  keywords: [
    "Yoruba dictionary",
    "Yoruba to English",
    "English to Yoruba",
    "Yoruba meaning",
    "Yoruba language",
    "Yoruba words",
    "Oro Lexicon",
    "Yoruba pronunciation",
    "Learn Yoruba",
  ],
  authors: [{ name: "Oredola Gbenga Augustine", url: "https://oredola.dev" }],
  creator: "Oredola Gbenga Augustine",
  publisher: "Oro Lexicon",
  verification: {
    google: "googledd300aa541d3a7e6",
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://lexicon.oredola.dev",
    siteName: "Oro Lexicon",
    title: "Oro Lexicon - Yoruba Dictionary",
    description: "Preserve Yoruba language - 1000+ Yoruba words with native audio, IPA, and examples by Oredola Gbenga Augustine.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Oro Lexicon" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Oro Lexicon - Yoruba Dictionary",
    description: "Preserve Yoruba language with native audio & accurate tones",
    creator: "@oredola",
  },
  alternates: {
    canonical: "https://lexicon.oredola.dev",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}