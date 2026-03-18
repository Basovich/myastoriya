import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import CareersPage from "@/app/pages/Careers";

export default async function Careers({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
      <CareersPage lang={lang} dict={dict} />
  );
}
