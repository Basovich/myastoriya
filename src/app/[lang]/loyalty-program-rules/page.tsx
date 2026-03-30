import { Locale } from "@/i18n/config";
import PolicyPage from "@/app/pages/PolicyPage/PolicyPage";
import loyaltyRules from "@/content/loyalty-rules.json";

export default async function LoyaltyProgramRules({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const data = loyaltyRules[lang as keyof typeof loyaltyRules] || loyaltyRules.ua;

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
