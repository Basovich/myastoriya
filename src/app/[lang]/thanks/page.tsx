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
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { lang } = await params;
    const { orderId } = await searchParams;

    return (
        <ThanksPage 
            lang={lang} 
            orderId={typeof orderId === 'string' ? orderId : undefined}
        />
    );
}
