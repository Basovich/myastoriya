import { Locale } from "@/i18n/config";
import OrderDetailsClient from "@/app/components/Personal/Orders/OrderDetails/OrderDetailsClient";

export default async function OrderDetailsPage({
    params,
}: {
    params: Promise<{ lang: Locale; id: string }>;
}) {
    const { lang, id } = await params;

    return <OrderDetailsClient lang={lang} orderId={id} />;
}
