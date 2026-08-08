import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LoginForm } from '../../components/login-form';
import { locales, messages, type Locale } from '../../lib/i18n';
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  if (!locales.includes(locale)) {
    notFound();
  }
  const t = messages[locale];
  const alternate = locale === 'en' ? 'bn' : 'en';
  return (
    <main>
      <nav>
        <strong>{t.title}</strong>
        <Link href={`/${alternate}`}>{t.language}</Link>
      </nav>
      <section>
        <p>{t.subtitle}</p>
        <h1>{t.signIn}</h1>
        <LoginForm labels={t} />
        <Link href={`/${locale}/register`}>{t.register}</Link>
      </section>
    </main>
  );
}
