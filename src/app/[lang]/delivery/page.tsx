import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import DeliveryAndPaymentPage from "@/app/pages/DeliveryAndPayment/DeliveryAndPaymentPage";
import { getShopsApi } from "@/lib/graphql/queries/shops";
import { getPolicyBlocksApi } from "@/lib/graphql/index";

export default async function DeliveryAndPayment({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  
  const [shopsResponse, policyBlocks] = await Promise.all([
    getShopsApi({ limit: 100 }, lang),
    getPolicyBlocksApi("payment", lang)
  ]);

  return (
      <DeliveryAndPaymentPage 
        lang={lang} 
        dict={dict} 
        initialShops={shopsResponse.shops.data} 
        policyBlocks={policyBlocks}
      />
  );
}
