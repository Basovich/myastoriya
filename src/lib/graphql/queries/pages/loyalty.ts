import { gqlRequest } from '../../client';

export interface UserDiscountInfo {
    discount?: number | null;
    discountGroupDiscount?: number | null;
    nextDiscount?: number | null;
    leftUntilNextStep?: number | null;
    totalOrdersAmount?: number | null;
    scale?: number | null;
    totalScale?: number | null;
}

const GET_USER_DISCOUNT_INFO = /* GraphQL */ `
    query GetUserDiscountInfo {
        userDiscountInfo {
            discount
            discountGroupDiscount
            nextDiscount
            leftUntilNextStep
            totalOrdersAmount
            scale
            totalScale
        }
    }
`;

const GET_LOYALTY_TERMS = /* GraphQL */ `
    query GetLoyaltyTerms {
        loyaltyTerms
    }
`;

const GET_LOYALTY_BARCODE = /* GraphQL */ `
    query GetLoyaltyBarcode {
        loyaltyBarcode
    }
`;

export async function getUserDiscountInfoApi(token: string, lang?: string): Promise<UserDiscountInfo | null> {
    try {
        const data = await gqlRequest<{ userDiscountInfo: UserDiscountInfo | null }>(
            GET_USER_DISCOUNT_INFO,
            undefined,
            { token, lang }
        );
        return data.userDiscountInfo;
    } catch (error) {
        console.error('Error fetching userDiscountInfo:', error);
        return null;
    }
}

export async function getLoyaltyTermsApi(lang?: string): Promise<string | null> {
    try {
        const data = await gqlRequest<{ loyaltyTerms: string | null }>(
            GET_LOYALTY_TERMS,
            undefined,
            { lang }
        );
        return data.loyaltyTerms;
    } catch (error) {
        console.error('Error fetching loyaltyTerms:', error);
        return null;
    }
}

export async function getLoyaltyBarcodeApi(token: string, lang?: string): Promise<string | null> {
    try {
        const data = await gqlRequest<{ loyaltyBarcode: string | null }>(
            GET_LOYALTY_BARCODE,
            undefined,
            { token, lang }
        );
        return data.loyaltyBarcode;
    } catch (error) {
        console.error('Error fetching loyaltyBarcode:', error);
        return null;
    }
}
