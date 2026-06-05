import { NextRequest, NextResponse } from 'next/server';

const GQL_ENDPOINT = 'https://dev-api.myastoriya.com.ua/graphql';

const PRODUCTS_FILTER_QUERY = /* GraphQL */ `
    mutation ProductsFilter($categoryId: Int) {
        productsFilter(categoryId: $categoryId) {
            productsCount
            blocks {
                type
                label
                key
                min
                max
                minValue
                maxValue
                values {
                    key
                    label
                    selected
                    disabled
                }
            }
        }
    }
`;

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;
        const categoryIdStr = searchParams.get('categoryId');
        const categoryId = categoryIdStr ? parseInt(categoryIdStr, 10) : undefined;

        const langParam = searchParams.get('lang');
        const contentLanguage = langParam === 'ru' ? 'ru_RU' : 'uk_UA';

        // Форвардимо cookies і user-agent для авторизованого доступу до productsFilter
        const cookieHeader = req.headers.get('cookie') ?? '';
        const userAgent = req.headers.get('user-agent') ?? '';
        const origin = req.headers.get('origin') ?? req.nextUrl.origin;

        const res = await fetch(GQL_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Language': contentLanguage,
                'cookie': cookieHeader,
                'user-agent': userAgent,
                'origin': origin,
                'referer': origin,
            },
            body: JSON.stringify({
                query: PRODUCTS_FILTER_QUERY,
                variables: { categoryId },
            }),
            cache: 'no-store',
        });

        const cacheHeaders = {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
        };

        if (!res.ok) {
            return NextResponse.json({ blocks: [], productsCount: 0 }, { headers: cacheHeaders });
        }

        const json = await res.json();

        if (json.errors?.length || !json.data?.productsFilter) {
            return NextResponse.json({ blocks: [], productsCount: 0 }, { headers: cacheHeaders });
        }

        return NextResponse.json(json.data.productsFilter, { headers: cacheHeaders });
    } catch {
        return NextResponse.json(
            { blocks: [], productsCount: 0 },
            {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                },
            }
        );
    }
}
