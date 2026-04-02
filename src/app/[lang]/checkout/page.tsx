import { Locale } from "@/i18n/config";
import CheckoutPage from "@/app/pages/Checkout/CheckoutPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
    },
};

export default async function Checkout({
    params,
}: {
    params: Promise<{ lang: Locale }>;
}) {
    const { lang } = await params;

    return <CheckoutPage lang={lang} />;
}
