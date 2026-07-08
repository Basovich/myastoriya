import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import ProductClient from "@/app/pages/Product/ProductClient";
import {
    getBlogsApi,
    getProductByIdApi,
    getPopularProductsApi,
    getSpecialsByProductApi,
    findProductIdBySlug,
    getCatalogTreeApi,
    getDeliveryBlocksApi,
    getProductsApi,
    getBoughtTogetherProductsApi,
    Product,
    OrderingInfoBlock,
    ProductCategory,
    BlogPost,
    ProductsResponse,
    ProductCostVariant,
    GraphQLError,
} from "@/lib/graphql";
import { notFound } from "next/navigation";
import { buildCategoryIndex, buildCategoryBreadcrumbs } from "@/utils/category-url";

type Props = {
    params: Promise<{ slug: string; lang: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

/**
 * Безпечний виклик API з retry-логікою.
 * При помилці повторює запит до `retries` разів із затримкою,
 * після чого повертає `fallback` замість того, щоб валити сторінку.
 * Після вичерпання всіх спроб — явно репортує помилку в Sentry.
 */
async function safeCall<T>(
    fn: () => Promise<T>,
    fallback: T,
    retries = 2,
): Promise<T> {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            if (attempt < retries) {
                const delay = 1000 * (attempt + 1); // 1s, 2s
                console.warn(
                    `[ProductPage] API error (attempt ${attempt + 1}/${retries + 1}), retrying in ${delay}ms...`,
                    err instanceof Error ? err.message : err,
                );
                await new Promise((r) => setTimeout(r, delay));
            } else {
                // Всі спроби вичерпано — логуємо та репортуємо в Sentry
                console.error(
                    `[ProductPage] Non-critical API error after ${retries + 1} attempts — using fallback:`,
                    err instanceof Error ? err.message : err,
                );
                try {
                    const Sentry = await import('@sentry/nextjs');
                    Sentry.captureException(err, {
                        tags: { component: 'ProductPage', type: 'safeCall_exhausted' },
                    });
                } catch {
                    // Ігноруємо помилки самого Sentry
                }
            }
        }
    }
    return fallback;
}

export default async function ProductPage({ params }: Props) {
    const { slug, lang } = await params;
    const dict = await getDictionary(lang as Locale);

    // Resolve slug → id (cached 1h by Next.js fetch cache)
    const productId = await findProductIdBySlug(slug, lang);
    if (!productId) notFound();

    const numericId = parseInt(productId);

    // Критичний запит:
    // - GraphQLError (логічна помилка бекенду, напр. «продукт не знайдено») → 404
    // - Мережева / несподівана помилка (тимчасово недоступний API) → re-throw → Next.js 500
    let product: Product | null = null;
    try {
        product = await getProductByIdApi(productId, lang);
    } catch (err) {
        if (err instanceof GraphQLError) {
            // Бекенд відповів логічною помилкою — продукт відсутній
            console.error('[ProductPage] GraphQL error fetching product (notFound):', err.message);
            notFound();
        }
        // Мережева / несподівана помилка — пробрасуємо далі
        // Next.js покаже error.tsx (500), а не хибний 404
        console.error('[ProductPage] Network/unexpected error fetching product:', err instanceof Error ? err.message : err);
        throw err;
    }
    if (!product) notFound();

    // Cost variants are loaded client-side in ProductClient to avoid unauthorized SSR errors
    const costVariants: ProductCostVariant[] = [];

    // Некритичні запити — паралельно, із retry та fallback
    const [blogsResponse, catalogTree, deliveryBlocks] = await Promise.all([
        safeCall<{ data: BlogPost[] }>(
            () => getBlogsApi({ limit: 3 }, lang),
            { data: [] },
        ),
        safeCall<ProductCategory[]>(
            () => getCatalogTreeApi(lang),
            [],
        ),
        safeCall<OrderingInfoBlock[]>(
            () => getDeliveryBlocksApi(lang),
            [],
        ),
    ]);

    // Некритичні запити — паралельно, із retry та fallback
    const [specialsProducts, boughtTogetherProducts, popularProducts, categoryProductsResponse] = await Promise.all([
        safeCall<Product[]>(
            () => getSpecialsByProductApi(numericId, 8, lang),
            [],
        ),
        product.categoryId
            ? safeCall<Product[]>(
                () => getBoughtTogetherProductsApi(Number(product!.categoryId), numericId, 10, lang),
                [],
            )
            : Promise.resolve<Product[]>([]),
        safeCall<Product[]>(
            () => getPopularProductsApi(undefined, 12, lang),
            [],
        ),
        product.categoryId
            ? safeCall<ProductsResponse>(
                () => getProductsApi({ categoryId: Number(product!.categoryId), sort: "rating", limit: 13 }, lang),
                { data: [], per_page: 13, current_page: 1, has_more_pages: false },
            )
            : Promise.resolve<ProductsResponse>({ data: [], per_page: 13, current_page: 1, has_more_pages: false }),
    ]);

    // Extract products from bundles if they exist (for "З цим товаром купують")
    const bundleProducts: Product[] = [];
    if (product.bundles) {
        for (const bundle of product.bundles) {
            if (bundle.items) {
                for (const item of bundle.items) {
                    if (item.product && String(item.product.id) !== String(product.id)) {
                        if (!bundleProducts.some(p => String(p.id) === String(item.product.id))) {
                            bundleProducts.push(item.product);
                        }
                    }
                }
            }
        }
    }

    // Determine what to show in "З цим товаром купують":
    // 1. boughtTogetherProducts (products from the dedicated API block)
    // 2. bundleProducts (products bundled together)
    // 3. specialsProducts (fallback specials)
    let finalRelatedProducts = specialsProducts;
    if (boughtTogetherProducts.length > 0) {
        finalRelatedProducts = boughtTogetherProducts;
    } else if (bundleProducts.length > 0) {
        finalRelatedProducts = bundleProducts;
    }

    const categoryIndex = buildCategoryIndex(catalogTree);
    const breadcrumbs = buildCategoryBreadcrumbs(product.categoryId, categoryIndex);

    return (
        <main>
            <ProductClient
                product={product}
                costVariants={costVariants}
                publications={blogsResponse.data}
                relatedProducts={finalRelatedProducts}
                popularProducts={popularProducts}
                categoryProducts={categoryProductsResponse.data || []}
                lang={lang as Locale}
                dict={dict}
                breadcrumbs={breadcrumbs}
                deliveryBlocks={deliveryBlocks}
            />
        </main>
    );
}

/**
 * Pre-generates all product pages at build time.
 * Slug is used as the route param — no id in the URL.
 */
export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
    /**
     * [LIGHTWEIGHT BUILD]
     * To avoid overwhelming the dev-API with thousands of requests during build
     * (causing 504 Gateway Timeouts), we return an empty array here.
     *
     * Product pages will be generated on-demand when first visited (ISR).
     */
    return [];
}
