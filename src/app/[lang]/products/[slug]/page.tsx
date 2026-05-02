import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import ProductClient from "@/app/pages/Product/ProductClient";
import {
    getBlogsApi,
    getProductByIdApi,
    getProductsApi,
    getPopularCategoriesApi,
    findProductIdBySlug,
} from "@/lib/graphql";
import { notFound } from "next/navigation";

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

    const [product, blogsResponse, relatedResponse] = await Promise.all([
        getProductByIdApi(productId, lang),
        getBlogsApi({ limit: 3 }, lang),
        getPopularCategoriesApi(lang).then(async (cats) => {
            const firstCatId = cats.length > 0 ? parseInt(cats[0].id) : null;
            if (!firstCatId) return { data: [] };
            return getProductsApi({ categoryId: firstCatId, limit: 8 }, lang);
        }),
    ]);

    if (!product) notFound();

    return (
        <main>
            <ProductClient
                product={product}
                publications={blogsResponse.data}
                relatedProducts={relatedResponse.data ?? []}
                lang={lang as Locale}
                dict={dict}
            />
        </main>
    );
}

/**
 * Pre-generates all product pages at build time.
 * Slug is used as the route param — no id in the URL.
 */
export const revalidate = 3600; // Revalidate at most every hour

/**
 * Generate static params for all products.
 * Now safer with limited build concurrency (cpus: 2 in next.config.ts)
 */
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
