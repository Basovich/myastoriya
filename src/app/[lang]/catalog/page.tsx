import { getDictionary } from '@/i18n/get-dictionary';
import { Locale } from '@/i18n/config';
import CatalogContent from '@/app/pages/Catalog/CatalogContent';
import { getCatalogTreeApi, getProductsApi, getProductsFilterApi, ProductsResponse, ProductCategory } from '@/lib/graphql';
import { getCategoryHref } from '@/utils/category-url';
import { resolveCategoryImageUrl } from '@/lib/graphql/queries/products';
import { parseRawProductionParam } from '@/utils/filter-params';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getAccessToken } from '@/app/actions/authActions';

import { getHreflangAlternates, getDynamicBaseUrl, getStaticPageSeoData } from '@/utils/seo';

interface CatalogPageProps {
    params: Promise<{ lang: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: CatalogPageProps): Promise<Metadata> {
    const { lang } = await params;
    const headersList = await headers();
    const dynamicBaseUrl = getDynamicBaseUrl(headersList);
    const seo = getStaticPageSeoData('catalog', lang);
    const alternates = getHreflangAlternates('/catalog/', lang, dynamicBaseUrl);

    const isRu = lang === 'ru';
    const title = isRu ? { absolute: seo.title } : seo.h1;

    return {
        title,
        description: seo.description,
        alternates: {
            canonical: alternates.canonical,
            languages: alternates.languages,
        },
        openGraph: {
            title: seo.title,
            description: seo.description,
            images: [{ url: '/images/og-image.jpg', alt: seo.h1 }],
        },
        twitter: {
            card: 'summary_large_image',
            title: seo.title,
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
    } catch (err) {
        console.error("[CatalogPage] Parallel fetch failed:", err);
    }
    productsResponse.current_page = page;

    const pageTitle = getStaticPageSeoData('catalog', lang).h1;

    // Категорії першого рівня для CategoryCircles
    const subcategoryItems = catalogTree.map(cat => ({
        name: cat.name,
        image: resolveCategoryImageUrl(cat) || '/icons/icon-category.svg',
        href: getCategoryHref(cat),
    }));

    const breadcrumbItems = [
        { label: lang === 'ru' ? 'Главная' : 'Головна', href: '/' },
        { label: pageTitle },
    ];

    return (
        <main>
            <CatalogContent
                lang={lang as Locale}
                dict={dict}
                initialProducts={productsResponse}
                categoryId={768}
                categoryName={pageTitle}
                breadcrumbItems={breadcrumbItems}
                subcategoryItems={subcategoryItems.length > 0 ? subcategoryItems : undefined}
                view={view}
                sortBy={sort}
                bannerUrl="/images/catalog/category-desktop.webp"
                mobileImage="/images/catalog/category-mobile.webp"
                initialTotalItems={initialTotalItems}
            />
        </main>
    );
}
