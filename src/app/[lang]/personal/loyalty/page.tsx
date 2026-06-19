import LoyaltyClient from "@/app/components/Personal/Loyalty/LoyaltyClient";
import { Locale } from "@/i18n/config";
import { getAccessToken } from "@/app/actions/authActions";
import { getUserDiscountInfoApi, getLoyaltyTermsApi } from "@/lib/graphql";

export default async function LoyaltyPage({ params }: { params: Promise<{ lang: Locale }> }) {
    const { lang } = await params;
    const token = await getAccessToken();

    const [discountInfo, terms] = await Promise.all([
        token ? getUserDiscountInfoApi(token, lang) : Promise.resolve(null),
        getLoyaltyTermsApi(lang)
    ]);

    return (
        <LoyaltyClient 
            lang={lang} 
            initialDiscountInfo={discountInfo}
            initialTerms={terms}
        />
    );
}
