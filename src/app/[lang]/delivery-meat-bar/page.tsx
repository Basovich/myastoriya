import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import DeliveryAndPaymentPage from "@/app/pages/DeliveryAndPayment/DeliveryAndPaymentPage";
import { getShopsApi } from "@/lib/graphql/queries/shops";
import { getPolicyBlocksApi, getDeliveryBlocksApi } from "@/lib/graphql/index";

export default async function DeliveryMeatBar({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  
  const [shopsResponse, policyBlocks, deliveryBlocks] = await Promise.all([
    getShopsApi({ limit: 100 }, lang),
    getPolicyBlocksApi(lang),
    getDeliveryBlocksApi(lang)
  ]);

  return (
      <DeliveryAndPaymentPage 
        lang={lang} 
        dict={dict} 
        isMeatBar={true} 
        initialShops={shopsResponse.shops.data} 
        policyBlocks={policyBlocks}
        deliveryBlocks={deliveryBlocks}
      />
  );
}
