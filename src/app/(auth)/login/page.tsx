export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import LoginForm from "./LoginForm";


export const metadata: Metadata = {
  title: "Sign in — Oredola Lexicon | Yorùbá Dictionary",
  description: "Sign in to Oro Lexicon by Oredola Gbenga Augustine. Preserve Egba, Ijebu and Standard Yorùbá with audio, IPA and examples.",
  keywords: ["Yoruba dictionary login", "Oredola Lexicon", "Yoruba preservation", "oredola.dev"],
  openGraph: {
    title: "Sign in — Oredola Lexicon",
    description: "Welcome back to the Yorùbá living archive.",
    url: "https://lexicon.oredola.dev/login",
    siteName: "Oro Lexicon by Oredola Gbenga ",
    type: "website",
  },
  robots: { index: false, follow: false },
};

export default function Page() {
  return <LoginForm />;
}
