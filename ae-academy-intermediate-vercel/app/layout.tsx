import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AE Academy Pro — Parcours After Effects intermédiaire",
  description:
    "Un parcours interactif de 40 leçons pour progresser vers un niveau intermédiaire solide sur After Effects.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
