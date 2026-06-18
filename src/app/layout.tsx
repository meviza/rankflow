import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

const locales = ['en', 'tr', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'ar', 'zh'] as const;
const defaultLocale = 'en';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';

  const browserLocale = acceptLanguage.split(',')[0]?.substring(0, 2);
  const matchedLocale = locales.includes(browserLocale as never) ? browserLocale : defaultLocale;

  redirect(`/${matchedLocale}`);
}
