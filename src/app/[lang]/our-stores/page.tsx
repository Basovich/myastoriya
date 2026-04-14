import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import OurStoresPage from "@/app/pages/OurStores";
import { getShopsApi } from "@/lib/graphql/queries/shops";

export default async function OurStores({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const shopsResponse = await getShopsApi({ limit: 100 }, lang);

  return (
      <OurStoresPage lang={lang} dict={dict} initialShops={shopsResponse.shops.data} />
  );
}
