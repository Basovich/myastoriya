import LoyaltyClient from "@/app/components/Personal/Loyalty/LoyaltyClient";
import { Locale } from "@/i18n/config";
import { getAccessToken } from "@/app/actions/authActions";
import { getUserDiscountInfoApi, getDiscountPageDataApi } from "@/lib/graphql";

export default async function LoyaltyPage({ params }: { params: Promise<{ lang: Locale }> }) {
    const { lang } = await params;
    const token = await getAccessToken();

    const [discountInfo, discountPageData] = await Promise.all([
        token ? getUserDiscountInfoApi(token, lang) : Promise.resolve(null),
        getDiscountPageDataApi(lang)
    ]);

    return (
        <LoyaltyClient 
            lang={lang} 
            initialDiscountInfo={discountInfo}
            discountPageData={discountPageData}
            initialTerms={discountPageData?.loyaltyTerms || null}
        />
    );
}
