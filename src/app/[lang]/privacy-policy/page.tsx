import { Locale } from "@/i18n/config";
import PolicyPage from "@/app/pages/PolicyPage/PolicyPage";
import { getPrivacyPolicyApi } from "@/lib/graphql";
import { PolicyPageContentItem } from "@/i18n/types";

export default async function Privacy({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  
  const apiData = await getPrivacyPolicyApi();
  const webContent = apiData?.webText;

  const labels = {
    ua: { home: "Головна", privacy: "Політика конфіденційності" },
    ru: { home: "Главная", privacy: "Политика конфиденциальности" }
  }[lang] || { home: "Головна", privacy: "Політика конфіденційності" };

  const breadcrumbs = [
    { label: labels.home, href: "/" },
    { label: labels.privacy }
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
