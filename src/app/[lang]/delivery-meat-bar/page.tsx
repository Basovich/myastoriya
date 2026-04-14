import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import DeliveryAndPaymentPage from "@/app/pages/DeliveryAndPayment/DeliveryAndPaymentPage";
import { getShopsApi } from "@/lib/graphql/queries/shops";

export default async function DeliveryMeatBar({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const shopsResponse = await getShopsApi({ limit: 100 }, lang);

  return (
      <DeliveryAndPaymentPage lang={lang} dict={dict} isMeatBar={true} initialShops={shopsResponse.shops.data} />
  );
}
