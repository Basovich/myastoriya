import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import ContactsPage from "@/app/pages/Contacts";
import { getContactsCategoriesApi } from "@/lib/graphql";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getStaticPageSeoData, getHreflangAlternates, getDynamicBaseUrl, fetchSeoMetadataByUrl, buildOpenGraphMetadata, generateBreadcrumbJsonLd, setRequestBreadcrumbJsonLd, formatTitleConfig } from "@/utils/seo";
import HreflangLinks from "@/app/components/HreflangLinks/HreflangLinks";

interface ContactsPageProps {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({ params }: ContactsPageProps): Promise<Metadata> {
  const { lang } = await params;
  const headersList = await headers();
  const dynamicBaseUrl = getDynamicBaseUrl(headersList);
  const fallbackSeo = getStaticPageSeoData("contacts", lang);
  const relativeUrl = `/${lang}/contacts/`;
  const seo = await fetchSeoMetadataByUrl(relativeUrl, lang, fallbackSeo);
  const alternates = getHreflangAlternates("/contacts/", lang, dynamicBaseUrl);
  const canonicalUrl = seo.canonical || alternates.canonical;

  const isRu = lang === "ru";
  const title = formatTitleConfig(seo.title, lang);

  const breadcrumbs = [
    { label: isRu ? 'Главная' : 'Головна', href: '/' },
    { label: isRu ? 'Контакты' : 'Контакти' }
  ];
  const jsonLdData = generateBreadcrumbJsonLd(breadcrumbs, lang, canonicalUrl, dynamicBaseUrl);
  setRequestBreadcrumbJsonLd(jsonLdData);

  return {
    title,
    description: seo.description,
    ...(seo.noindex ? { robots: { index: false, follow: false } } : {}),
    openGraph: buildOpenGraphMetadata({
      title: seo.title,
      description: seo.description,
      canonicalUrl,
      lang,
      type: "website",
    }),
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: ["/images/og-image.jpg"],
    },
  };
}

export default async function Contacts({
  params,
}: ContactsPageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const alternates = getHreflangAlternates("/contacts/", lang, getDynamicBaseUrl(await headers()));
  const seo = await fetchSeoMetadataByUrl(`/${lang}/contacts/`, lang, getStaticPageSeoData("contacts", lang));
  
  // Fetch contact categories and nested contacts from API
  const response = await getContactsCategoriesApi(lang).catch(() => ({ contactCategories: [] }));
  const categories = response?.contactCategories || [];

  return (
    <>
      <HreflangLinks canonical={seo.canonical || alternates.canonical} languages={alternates.languages} />
      <ContactsPage 
        lang={lang} 
        dict={dict} 
        categories={categories} 
      />
    </>
  );
}
