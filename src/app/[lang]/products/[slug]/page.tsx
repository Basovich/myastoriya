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

    // Load related (specials), global popular products, and category-specific popular products in parallel
    const [specialsProducts, popularProducts, categoryProductsResponse] = await Promise.all([
        getSpecialsByProductApi(numericId, 8, lang),
        getPopularProductsApi(undefined, 12, lang),
        product.categoryId
            ? getProductsApi({ categoryId: Number(product.categoryId), sort: "rating", limit: 13 }, lang)
            : Promise.resolve({ data: [] }),
    ]);

    const categoryIndex = buildCategoryIndex(catalogTree);
    const breadcrumbs = buildCategoryBreadcrumbs(product.categoryId, categoryIndex);

    return (
        <main>
            <ProductClient
                product={product}
                costVariants={costVariants}
                publications={blogsResponse.data}
                relatedProducts={specialsProducts}
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
