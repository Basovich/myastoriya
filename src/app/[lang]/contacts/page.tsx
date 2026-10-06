import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import ContactsPage from "@/app/pages/Contacts";
import { getContactsCategoriesApi } from "@/lib/graphql";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getStaticPageSeoData, getHreflangAlternates, getDynamicBaseUrl, fetchSeoMetadataByUrl } from "@/utils/seo";

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

  const isRu = lang === "ru";
  const title = isRu ? { absolute: seo.title } : seo.title;

  return {
    title,
    description: seo.description,
    ...(seo.noindex ? { robots: { index: false, follow: false } } : {}),
    alternates: {
      canonical: seo.canonical || alternates.canonical,
      languages: alternates.languages,
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      images: [{ url: "/images/og-image.jpg", alt: seo.title }],
    },
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
  
  // Fetch contact categories and nested contacts from API
  const response = await getContactsCategoriesApi(lang);
  const categories = response?.contactCategories || [];

  return (
      <ContactsPage 
        lang={lang} 
        dict={dict} 
        categories={categories} 
      />
  );
}
