import { Locale } from "@/i18n/config";
import ThanksPage from "@/app/pages/Thanks";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Дякуємо за замовлення",
    robots: {
        index: false,
        follow: false,
    },
};

export default async function Thanks({
    params,
    searchParams,
}: {
    params: Promise<{ lang: Locale }>;
    searchParams: Promise<{ orderId?: string | string[]; payment?: string; isOnline?: string; status?: string }>;
}) {
    const { lang } = await params;
    const { orderId, payment, isOnline, status } = await searchParams;

    const isOnlinePayment = isOnline === 'true' || payment === 'online' || Boolean(status);

    return (
        <ThanksPage 
            lang={lang} 
            orderId={typeof orderId === 'string' ? orderId : undefined}
            isOnline={isOnlinePayment}
        />
    );
}
