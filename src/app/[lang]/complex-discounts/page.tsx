import type { Metadata } from "next";
import { headers } from "next/headers";
import ActionsGrid from "../../components/ActionsGrid/ActionsGrid";
import { getSpecialsApi } from "@/lib/graphql";
import { getAccessToken } from "@/app/actions/authActions";
import { getStaticPageSeoData, getHreflangAlternates, getDynamicBaseUrl, parsePageNum, formatTitleWithPage, buildOpenGraphMetadata, generateBreadcrumbJsonLd, setRequestBreadcrumbJsonLd } from "@/utils/seo";

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
    const seo = getStaticPageSeoData('complex-discounts', lang);
    const alternates = getHreflangAlternates('/complex-discounts/', lang, dynamicBaseUrl, pageNum);

    const rawTitle = seo.title;
    const formattedTitleStr = formatTitleWithPage(rawTitle, pageNum, lang);
    const title = { absolute: formattedTitleStr };

    const pageRobots = pageNum > 1 ? { index: false, follow: true } : undefined;

    const isRu = lang === "ru";
    const breadcrumbs = [
        { label: isRu ? "Главная" : "Головна", href: "/" },
        { label: isRu ? "Комплексные скидки" : "Комплексні знижки" }
    ];
    const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs, lang, alternates.canonical, dynamicBaseUrl);
    setRequestBreadcrumbJsonLd(breadcrumbJsonLd);

    return {
        title,
        description: seo.description,
        ...(pageRobots && { robots: pageRobots }),
        alternates: {
            canonical: alternates.canonical,
            languages: alternates.languages,
        },
        openGraph: buildOpenGraphMetadata({
            title: formattedTitleStr,
            description: seo.description,
            canonicalUrl: alternates.canonical,
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

// This is the index page for Complex Discounts: /[lang]/complex-discounts
export default async function ComplexDiscountsPage({
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
    const specialsResponse = await getSpecialsApi(12, page, lang, token ?? undefined);

    const activeSpecials = (specialsResponse?.data || []).filter(special => {
        if (!special.products || special.products.length < 2) return false;
        if (typeof special.productsCount === 'number' && special.productsCount > 0 && special.products.length < special.productsCount) {
            return false;
        }
        return special.products.every(product => product.available);
    });

    const initialItems = activeSpecials.map(special => {
        let image = special.image?.size2x || special.image?.size1x || "";
        if (image && image.startsWith('/')) {
            image = `https://dev-api.myastoriya.com.ua${image}`;
        }
        return {
            id: parseInt(special.id),
            slug: special.slug,
            title: special.title || "",
            image: image,
            date: special.expiresAt ? new Date(special.expiresAt).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'uk-UA') : "",
            discount: special.amount ? `-${special.amount}%` : null
        };
    });

    const totalPages = specialsResponse?.has_more_pages ? page + 1 : page;

    return (
        <main>
            <ActionsGrid
                initialItems={initialItems}
                lang={lang}
                pageType="complex-discounts"
                initialHasMore={specialsResponse?.has_more_pages}
                initialPage={page}
                totalPages={totalPages}
            />
        </main>
    );
}
