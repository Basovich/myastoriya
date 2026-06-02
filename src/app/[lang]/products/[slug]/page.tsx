import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import ProductClient from "@/app/pages/Product/ProductClient";
import {
    getBlogsApi,
    getProductByIdApi,
    getProductCostVariantsApi,
    getPopularProductsApi,
    getSpecialsByProductApi,
    findProductIdBySlug,
    getCatalogTreeApi,
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

    const [product, blogsResponse, catalogTree] = await Promise.all([
        getProductByIdApi(productId, lang),
        getBlogsApi({ limit: 3 }, lang),
        getCatalogTreeApi(lang),
    ]);

    if (!product) notFound();

    // Load cost variants only if the product has them (avoid extra request)
    const costVariants = product.hasCostVariants
        ? await getProductCostVariantsApi(productId, lang)
        : [];

    // Load related (specials) + popular products in parallel
    const [specialsProducts, popularProducts] = await Promise.all([
        getSpecialsByProductApi(numericId, 8, lang),
        getPopularProductsApi(numericId, 12, lang),
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
                lang={lang as Locale}
                dict={dict}
                breadcrumbs={breadcrumbs}
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
