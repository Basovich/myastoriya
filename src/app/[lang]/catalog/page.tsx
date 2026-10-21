import { getDictionary } from '@/i18n/get-dictionary';
import { Locale } from '@/i18n/config';
import CatalogContent from '@/app/pages/Catalog/CatalogContent';
import { getCatalogTreeApi, getProductsApi, getProductsFilterApi, ProductsResponse, ProductCategory, FilterBlock } from '@/lib/graphql';
import { getCategoryHref } from '@/utils/category-url';
import { resolveCategoryImageUrl } from '@/lib/graphql/queries/products';
import { parseRawProductionParam } from '@/utils/filter-params';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getAccessToken } from '@/app/actions/authActions';

import { getHreflangAlternates, getDynamicBaseUrl, fetchSeoMetadataByUrl, parsePageNum, formatTitleWithPage, buildOpenGraphMetadata, generateBreadcrumbJsonLd, setRequestBreadcrumbJsonLd, resolvePageHreflangLinks } from '@/utils/seo';
import HreflangLinks from '@/app/components/HreflangLinks/HreflangLinks';

interface CatalogPageProps {
    params: Promise<{ lang: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params, searchParams }: CatalogPageProps): Promise<Metadata> {
    const { lang } = await params;
    const resolvedSearchParams = await searchParams;
    const pageNum = parsePageNum(resolvedSearchParams?.page);

    const headersList = await headers();
    const dynamicBaseUrl = getDynamicBaseUrl(headersList);
    const relativeUrl = `/${lang}/catalog/`;
    const seo = await fetchSeoMetadataByUrl(relativeUrl, lang);
    const alternates = getHreflangAlternates('/catalog/', lang, dynamicBaseUrl, pageNum);

    const rawTitle = seo.title || "";
    const formattedTitleStr = formatTitleWithPage(rawTitle, pageNum, lang);

    const canonicalUrl = pageNum > 1 ? alternates.canonical : (seo.canonical || alternates.canonical);
    const isPageNoindex = pageNum > 1 || Boolean(seo.noindex);
    const pageRobots = isPageNoindex ? { index: false, follow: true } : undefined;

    const isRu = lang === 'ru';
    const breadcrumbItems = [
        { label: isRu ? 'Главная' : 'Головна', href: '/' },
        ...(seo.h1 ? [{ label: seo.h1 }] : []),
    ];
    const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbItems, lang, canonicalUrl, dynamicBaseUrl);
    setRequestBreadcrumbJsonLd(breadcrumbJsonLd);

    return {
        title: formattedTitleStr,
        description: seo.description,
        ...(pageRobots && { robots: pageRobots }),
        openGraph: buildOpenGraphMetadata({
            title: formattedTitleStr,
            description: seo.description,
            canonicalUrl,
            lang,
            type: 'website',
        }),
        twitter: {
            card: 'summary_large_image',
            title: formattedTitleStr,
            description: seo.description,
            images: ['/images/og-image.jpg'],
        },
    };
}

export default async function CatalogPage({ params, searchParams }: CatalogPageProps) {
    const { lang } = await params;
    const resolvedSearchParams = await searchParams;
    const dict = await getDictionary(lang as Locale);

    const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page as string) : 1;
    const view = (resolvedSearchParams.view as 'list' | 'grid') || 'grid';
    const sort = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : undefined;
    const rawProduction = parseRawProductionParam(resolvedSearchParams as Record<string, string | string[] | undefined>);

    // Завантажуємо дерево категорій та товари паралельно
    const token = await getAccessToken();

    let catalogTree: ProductCategory[] = [];
    let productsResponse: ProductsResponse = {
        data: [],
        per_page: 12,
        current_page: page,
        has_more_pages: false,
    };
    let initialTotalItems: number | undefined = undefined;
    let filterBlocks: FilterBlock[] = [];

    try {
        const [tree, products, filterData] = await Promise.all([
            getCatalogTreeApi(lang, 768, token ?? undefined).catch((err) => {
                console.error("[CatalogPage] Failed to fetch catalog tree:", err);
                return [] as ProductCategory[];
            }),
            getProductsApi({ limit: 12, page, sort, rawProduction }, lang, token ?? undefined).catch((err) => {
                console.error("[CatalogPage] Failed to fetch products:", err);
                return null;
            }),
            getProductsFilterApi(768, lang).catch(() => null),
        ]);
        catalogTree = tree;
        if (products) {
            productsResponse = products;
        }
        if (filterData?.productsCount) {
            initialTotalItems = filterData.productsCount;
        }
        if (filterData?.blocks) {
            filterBlocks = filterData.blocks;
        }
    } catch (err) {
        console.error("[CatalogPage] Parallel fetch failed:", err);
    }
    productsResponse.current_page = page;

    const [hreflangLinks, seo] = await Promise.all([
        resolvePageHreflangLinks('/catalog/', lang, undefined, getDynamicBaseUrl(await headers()), parsePageNum(resolvedSearchParams?.page)),
        fetchSeoMetadataByUrl(`/${lang}/catalog/`, lang),
    ]);

    const pageTitle = seo.h1 || '';

    // Категорії першого рівня для CategoryCircles
    const subcategoryItems = catalogTree.map(cat => ({
        name: cat.name,
        image: resolveCategoryImageUrl(cat) || '/icons/icon-category.svg',
        href: getCategoryHref(cat),
    }));

    const breadcrumbItems = [
        { label: lang === 'ru' ? 'Главная' : 'Головна', href: '/' },
        ...(pageTitle ? [{ label: pageTitle }] : []),
    ];

    return (
        <main>
            <HreflangLinks canonical={hreflangLinks.canonical} languages={hreflangLinks.languages} />
            <CatalogContent
                lang={lang as Locale}
                dict={dict}
                initialProducts={productsResponse}
                categoryId={768}
                categoryName={pageTitle || undefined}
                h1={seo.h1 || undefined}
                breadcrumbItems={breadcrumbItems}
                subcategoryItems={subcategoryItems.length > 0 ? subcategoryItems : undefined}
                view={view}
                sortBy={sort}
                filterBlocks={filterBlocks}
                bannerUrl="/images/catalog/category-desktop.webp"
                mobileImage="/images/catalog/category-mobile.webp"
                initialTotalItems={initialTotalItems}
            />
        </main>
    );
}
