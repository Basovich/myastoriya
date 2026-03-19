import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import ApplicantFormPage from "@/app/pages/ApplicantFormPage";

export default async function Apply({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
      <ApplicantFormPage lang={lang} dict={dict} />
  );
}
