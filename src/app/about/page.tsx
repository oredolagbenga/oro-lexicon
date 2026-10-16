// src/app/about/page.tsx - SERVER (SEO + fetch total)
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About — Oro Lexicon | Preserving Yorùbá by Oredola Gbenga Augustine",
  description: "Oro Lexicon by Oredola Gbenga Augustine at oredola.dev — community-driven Yorùbá archive preserving Egba, Ijebu & Standard Yorùbá with accurate tones, IPA and native audio. lexicon.oredola.dev",
  authors: [{ name: "Oredola Gbenga Augustine", url: "https://oredola.dev" }],
  openGraph: {
    title: "About Oro Lexicon — Yorùbá is memory",
    description: "We preserve Egba, Ijebu & Standard Yorùbá with tonal accuracy and native audio. Built by Oredola Gbenga Augustine at oredola.dev",
    url: "https://lexicon.oredola.dev/about",
    siteName: "Oro Lexicon",
    type: "website",
  },
  alternates: { canonical: "https://lexicon.oredola.dev/about" },
};

export default async function Page() {
  // Fetch total approved words from DB
  const total = await prisma.word.count({
    where: { status: "APPROVED" },
  });

  return <AboutClient total={total} />;
}