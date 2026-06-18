import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SEO/GEO Scanner — RankFlow",
  description:
    "Get an instant SEO and GEO audit for any website. Scores, fixes, and AI-generated improvement roadmap.",
  robots: { index: false, follow: true },
};

export default function ScanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
