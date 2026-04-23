import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import PolicyPage from "@/app/pages/PolicyPage/PolicyPage";

export default async function Privacy({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const data = dict.home.privacyPolicyPage;

  const breadcrumbs = [
    { label: data.breadcrumbs.home, href: "/" },
    { label: data.breadcrumbs.privacy }
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
