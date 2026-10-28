import type { Metadata } from "next";
import ForgotForm from "./ForgotForm";

export const metadata: Metadata = {
  title: "Forgot Password — Oro Lexicon",
  description: "Reset your Oro Lexicon password",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ForgotForm />;
}