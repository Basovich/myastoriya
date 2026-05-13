import { Locale } from "@/i18n/config";
import PolicyPage from "@/app/pages/PolicyPage/PolicyPage";
import { getTermsOfUseApi } from "@/lib/graphql";
import { PolicyPageContentItem } from "@/i18n/types";

export default async function LoyaltyProgramRules({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  
  const apiData = await getTermsOfUseApi();
  const webContent = apiData?.webText;

  const labels = {
    ua: { home: "Головна", loyalty: "Правила програми лояльності" },
    ru: { home: "Главная", loyalty: "Правила программы лояльности" }
  }[lang] || { home: "Головна", loyalty: "Правила програми лояльності" };

  const breadcrumbs = [
    { label: labels.home, href: "/" },
    { label: labels.loyalty }
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
