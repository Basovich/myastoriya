import { Locale } from "@/i18n/config";
import PolicyPage from "@/app/pages/PolicyPage/PolicyPage";
import { loyaltyRulesContent } from "@/app/pages/PolicyPage/loyalty-rules.content";

export default async function LoyaltyProgramRules({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const data = (loyaltyRulesContent as any)[lang] || loyaltyRulesContent.ua;

  const breadcrumbs = [
    { label: data.breadcrumbs.home, href: "/" },
    { label: data.breadcrumbs.loyalty }
  ];

  return (
      <PolicyPage 
        lang={lang} 
        title={data.title}
        breadcrumbs={breadcrumbs}
        content={data.content as any}
      />
  );
}
