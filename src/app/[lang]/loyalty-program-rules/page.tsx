import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import PolicyPage from "@/app/pages/PolicyPage/PolicyPage";

export default async function LoyaltyProgramRules({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const data = dict.home.loyaltyProgramRulesPage;

  const breadcrumbs = [
    { label: data.breadcrumbs.home, href: "/" },
    { label: data.breadcrumbs.loyalty }
  ];

  return (
      <PolicyPage 
        lang={lang} 
        title={data.title}
        breadcrumbs={breadcrumbs}
        content={data.content}
      />
  );
}
