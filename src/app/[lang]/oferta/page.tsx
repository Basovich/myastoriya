import { Locale } from "@/i18n/config";
import PolicyPage from "@/app/pages/PolicyPage/PolicyPage";
import { getContractOfferApi } from "@/lib/graphql";
import { PolicyPageContentItem } from "@/i18n/types";

export default async function OfertaPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  
  const apiData = await getContractOfferApi();
  const webContent = apiData?.webText;

  const labels = {
    ua: { home: "Головна", oferta: "Публічна оферта" },
    ru: { home: "Главная", oferta: "Публичная оферта" }
  }[lang] || { home: "Головна", oferta: "Публічна оферта" };

  const breadcrumbs = [
    { label: labels.home, href: "/" },
    { label: labels.oferta }
  ];

  const content: PolicyPageContentItem[] = webContent
    ? [{ type: 'html', value: webContent }]
    : [];

  return (
    <PolicyPage 
      lang={lang} 
      breadcrumbs={breadcrumbs}
      content={content}
    />
  );
}
