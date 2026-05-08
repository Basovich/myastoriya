import LoyaltyClient from "@/app/components/Personal/Loyalty/LoyaltyClient";
import { Locale } from "@/i18n/config";

export default async function LoyaltyPage({ params }: { params: Promise<{ lang: Locale }> }) {
    const { lang } = await params;
    return <LoyaltyClient lang={lang} />;
}
