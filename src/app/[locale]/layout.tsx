
import type { Metadata } from 'next';
import type { Locale } from '@/types';
import { locales as availableLocalesConfig } from '@/locales';

// This function generates static paths for each supported locale.
// It's used by Next.js to know which locale paths to pre-render.
export async function generateStaticParams() {
  return Object.keys(availableLocalesConfig).map((locale) => ({ locale }));
}

// This function can generate metadata (like title, description) specific to the locale.
// The `lang` attribute on the <html> tag will be automatically set by Next.js
// based on the `locale` param if you are using App Router i18n features fully.
export async function generateMetadata({ params }: { params: { locale: Locale } }): Promise<Metadata> {
  // For now, we don't have locale-specific metadata, so it's empty.
  // You could load translations here to set, for example, a localized title.
  // e.g., title: `${t('appName')} - ${params.locale.toUpperCase()}`
  return {
    // Example:
    //alternates: {
    //  canonical: `/${params.locale}`,
    //  languages: {
    //    'en-US': '/en',
    //    'mr-IN': '/mr',
    //    'hi-IN': '/hi',
    //   },
    // },
  };
}

export default function LocaleLayout({
  children,
  params, 
}: {
  children: React.ReactNode;
  params: { locale: Locale }; // The locale parameter from the URL segment
}) {
  // This layout component wraps pages that are under a [locale] segment.
  // For example, /en/some-page or /mr/another-page.
  // The main AuthProvider and I18nProvider are still in the root src/app/layout.tsx.
  // The I18nProvider in the root layout will handle setting the locale
  // based on localStorage or the LanguageSwitcher.
  // If you want path-based locale to *override* localStorage for these specific routes,
  // you'd need to adjust I18nProvider or pass params.locale down and use it.
  // For now, this layout is minimal and primarily serves to establish the [locale] path.
  // Children rendered here will inherit providers from the root layout.
  return <>{children}</>;
}
