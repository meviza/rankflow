import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RankFlow — AI-Powered SEO & GEO Analytics',
  description: 'Optimize your website for Google and AI search engines.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
