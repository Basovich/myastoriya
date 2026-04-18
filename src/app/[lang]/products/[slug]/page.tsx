import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import Header from "@/app/components/Header/Header";
import Footer from "@/app/components/Footer/Footer";
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
        <>
            <Header lang={lang as Locale} />
            <ProductClient
                product={product}
                publications={blogsResponse.data}
                relatedProducts={relatedResponse.data ?? []}
                lang={lang as Locale}
                dict={dict}
            />
            <Footer lang={lang as Locale} />
        </>
    );
}

/**
 * Pre-generates all product pages at build time.
 * Slug is used as the route param — no id in the URL.
 */
export async function generateStaticParams() {
    try {
        const limit = 100;
        const allSlugs: { slug: string }[] = [];
        let page = 1;

        while (true) {
            const response = await getProductsApi({ limit, page });
            for (const p of response.data) {
                if (p.slug) allSlugs.push({ slug: p.slug });
            }
            if (!response.has_more_pages) break;
            page++;
        }

        return allSlugs;
    } catch {
        return [];
    }
}

export const revalidate = 3600;
