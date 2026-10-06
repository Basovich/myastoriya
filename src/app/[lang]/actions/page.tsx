import type { Metadata } from "next";
import { headers } from "next/headers";
import ActionsGrid from "../../components/ActionsGrid/ActionsGrid";
import { getSalesApi } from "@/lib/graphql/queries/pages/home/sales";
import { getProductsApi } from "@/lib/graphql";
import { getAccessToken } from "@/app/actions/authActions";
import { getStaticPageSeoData, getHreflangAlternates, getDynamicBaseUrl, fetchSeoMetadataByUrl, parsePageNum, formatTitleWithPage } from "@/utils/seo";

export async function generateMetadata({
    params,
    searchParams,
}: {
    params: Promise<{ lang: "ua" | "ru" }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
    const { lang } = await params;
    const resolvedSearchParams = await searchParams;
    const pageNum = parsePageNum(resolvedSearchParams?.page);

    const headersList = await headers();
    const dynamicBaseUrl = getDynamicBaseUrl(headersList);
    const fallbackSeo = getStaticPageSeoData('actions', lang);
    const relativeUrl = `/${lang}/actions/`;
    const seo = await fetchSeoMetadataByUrl(relativeUrl, lang, fallbackSeo);
    const alternates = getHreflangAlternates('/actions/', lang, dynamicBaseUrl, pageNum);

    const rawTitle = seo.title;
    const formattedTitleStr = formatTitleWithPage(rawTitle, pageNum, lang);
    const title = lang === 'ru' ? { absolute: formattedTitleStr } : formattedTitleStr;

    const isPageNoindex = pageNum > 1 || Boolean(seo.noindex);
    const pageRobots = isPageNoindex ? { index: false, follow: true } : undefined;

    return {
        title,
        description: seo.description,
        ...(seo.keywords && { keywords: seo.keywords }),
        ...(pageRobots && { robots: pageRobots }),
        alternates: {
            canonical: pageNum > 1 ? alternates.canonical : (seo.canonical || alternates.canonical),
            languages: alternates.languages,
        },
        openGraph: {
            title: formattedTitleStr,
            description: seo.description,
            images: [{ url: '/images/og-image.jpg', alt: formattedTitleStr }],
        },
        twitter: {
            card: "summary_large_image",
            title: formattedTitleStr,
            description: seo.description,
            images: ['/images/og-image.jpg'],
        },
    };
}

// This is the index page for Actions: /[lang]/actions
export default async function ActionsPage({
    params,
    searchParams,
}: {
    params: Promise<{ lang: "ua" | "ru" }>;
    searchParams: Promise<{ page?: string }>;
}) {
    const { lang } = await params;
    const { page: pageQuery } = await searchParams;
    const page = Math.max(1, parseInt(pageQuery || "1", 10));

    const token = await getAccessToken();
    const salesResponse = await getSalesApi(12, page, lang, token ?? undefined);

    const activeSalesChecks = await Promise.all(
        (salesResponse?.data || []).map(async (sale) => {
            try {
                const products = await getProductsApi(
                    { saleId: parseInt(sale.id), limit: 1, silent: true },
                    lang,
                    token ?? undefined,
                );
                return { sale, hasProducts: products.data.length > 0 };
            } catch {
                return { sale, hasProducts: false };
            }
        })
    );

    const activeSales = activeSalesChecks.filter(c => c.hasProducts).map(c => c.sale);

    const initialItems = activeSales.map(sale => ({
        id: parseInt(sale.id),
        slug: sale.slug,
        title: sale.name,
        image: sale.banner?.size2x || sale.banner?.size1x || sale.image?.size2x || sale.image?.size1x || "",
        imageWeb: sale.bannerWeb,
        date: sale.expiresAt ? new Date(sale.expiresAt).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'uk-UA') : ""
    }));

    const totalPages = salesResponse?.has_more_pages ? page + 1 : page;

    return (
        <main>
            <ActionsGrid
                initialItems={initialItems}
                lang={lang}
                pageType="promotions"
                initialHasMore={salesResponse?.has_more_pages}
                initialPage={page}
                totalPages={totalPages}
            />
        </main>
    );
}
