import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import PrivacyPolicyPage from "@/app/pages/PrivacyPolicy/PrivacyPolicyPage";

export default async function Privacy({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
      <PrivacyPolicyPage lang={lang} dict={dict} />
  );
}
