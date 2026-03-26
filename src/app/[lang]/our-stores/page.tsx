import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import OurStoresPage from "@/app/pages/OurStores";

export default async function OurStores({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
      <OurStoresPage lang={lang} dict={dict} />
  );
}
