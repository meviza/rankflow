import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — RankFlow",
  description: "Your SEO & GEO analytics dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
