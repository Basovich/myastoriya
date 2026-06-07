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
} from "@/lib/graphql";
import { notFound } from "next/navigation";
import { buildCategoryIndex, buildCategoryBreadcrumbs } from "@/utils/category-url";

type Props = {
    params: Promise<{ slug: string; lang: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ProductPage({ params }: Props) {
    const { slug, lang } = await params;
    const dict = await getDictionary(lang as Locale);

    // Resolve slug → id (cached 1h by Next.js fetch cache)
    const productId = await findProductIdBySlug(slug, lang);
    if (!productId) notFound();

    const numericId = parseInt(productId);

    const [product, blogsResponse, catalogTree, deliveryBlocks] = await Promise.all([
        getProductByIdApi(productId, lang),
        getBlogsApi({ limit: 3 }, lang),
        getCatalogTreeApi(lang),
        getDeliveryBlocksApi(lang),
    ]);

    if (!product) notFound();

    // Cost variants are loaded client-side in ProductClient to avoid unauthorized SSR errors
    const costVariants: any[] = [];

    // Load related (specials), bought together, global popular products, and category-specific popular products in parallel
    const [specialsProducts, boughtTogetherProducts, popularProducts, categoryProductsResponse] = await Promise.all([
        getSpecialsByProductApi(numericId, 8, lang),
        product.categoryId
            ? getBoughtTogetherProductsApi(Number(product.categoryId), numericId, 10, lang)
            : Promise.resolve([]),
        getPopularProductsApi(undefined, 12, lang),
        product.categoryId
            ? getProductsApi({ categoryId: Number(product.categoryId), sort: "rating", limit: 13 }, lang)
            : Promise.resolve({ data: [] }),
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
