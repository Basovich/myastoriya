import LoyaltyClient from "@/app/components/Personal/Loyalty/LoyaltyClient";
import { Locale } from "@/i18n/config";

export default function LoyaltyPage({ params: { lang } }: { params: { lang: Locale } }) {
    return <LoyaltyClient lang={lang} />;
}
