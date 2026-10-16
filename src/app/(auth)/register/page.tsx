import type { Metadata } from "next";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = {
  title: "Create account — Oredola Lexicon | Yorùbá Dictionary",
  description: "Join 42 contributors preserving Yorùbá dialects — Egba, Ijebu and Standard. Add words, audio and living examples. Built by Oredola Gbenga Augustine.",
  keywords: ["Yoruba dictionary", "Yoruba dialects", "Egba", "Ijebu", "Oredola", "GNETSOLUTION", "Yoruba language preservation"],
  authors: [{ name: "Oredola Gbenga Augustine", url: "https://oredola.dev" }],
  openGraph: {
    title: "Create account — Oredola Lexicon",
    description: "Your grandmother's word matters. Join the living archive.",
    url: "https://lexicon.oredola.dev/register",
    siteName: "Oredola Lexicon",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <RegisterForm />;
}
