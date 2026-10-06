import type { Metadata } from "next";
import { headers } from "next/headers";
import ActionsGrid from "../../components/ActionsGrid/ActionsGrid";
import { getSalesApi } from "@/lib/graphql/queries/pages/home/sales";
import { getProductsApi } from "@/lib/graphql";
import { getAccessToken } from "@/app/actions/authActions";
import { getStaticPageSeoData, getHreflangAlternates, getDynamicBaseUrl, fetchSeoMetadataByUrl, parsePageNum, formatTitleWithPage, buildOpenGraphMetadata, generateBreadcrumbJsonLd, setRequestBreadcrumbJsonLd } from "@/utils/seo";

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

    const canonicalUrl = pageNum > 1 ? alternates.canonical : (seo.canonical || alternates.canonical);
    const isPageNoindex = pageNum > 1 || Boolean(seo.noindex);
    const pageRobots = isPageNoindex ? { index: false, follow: true } : undefined;

    const isRu = lang === "ru";
    const breadcrumbs = [
        { label: isRu ? "Главная" : "Головна", href: "/" },
        { label: isRu ? "Акции" : "Акції" }
    ];
    const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs, lang, canonicalUrl, dynamicBaseUrl);
    setRequestBreadcrumbJsonLd(breadcrumbJsonLd);

    return {
        title,
        description: seo.description,
        ...(pageRobots && { robots: pageRobots }),
        alternates: {
            canonical: canonicalUrl,
            languages: alternates.languages,
        },
        openGraph: buildOpenGraphMetadata({
            title: formattedTitleStr,
            description: seo.description,
            canonicalUrl,
            lang,
            type: "website",
        }),
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
