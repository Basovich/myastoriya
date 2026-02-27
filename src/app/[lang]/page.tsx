import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import HomePage from "@/app/pages/Home";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
      <HomePage lang={lang} dict={dict} />
  );
}
