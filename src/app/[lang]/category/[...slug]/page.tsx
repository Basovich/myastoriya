import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { getDictionary } from '@/i18n/get-dictionary';
import { Locale } from '@/i18n/config';
import CatalogContent from '@/app/pages/Catalog/CatalogContent';
import {
    getCatalogTreeApi,
    getProductsApi,
    getPopularProductsApi,
    getCategoryByIdApi,
    getFaqQuestionsApi,
    resolveCategoryImageUrl,
    ProductCategory,
    Product,
    ProductsResponse,
} from '@/lib/graphql';
import { buildCategoryIndex, buildCategoryBreadcrumbs, getCategoryHref, shouldRedirectForLocality } from '@/utils/category-url';
import { parseFilterParams, parseRawProductionParam } from '@/utils/filter-params';
import { getAccessToken } from '@/app/actions/authActions';
import { getHreflangAlternates, getDynamicBaseUrl } from '@/utils/seo';

interface DynamicCategoryPageProps {
    params: Promise<{ lang: string; slug: string[] }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: DynamicCategoryPageProps): Promise<Metadata> {
    const { lang, slug } = await params;
    if (!slug || slug.length === 0) return {};

    const headersList = await headers();
    const dynamicBaseUrl = getDynamicBaseUrl(headersList);

    const lastSegment = slug[slug.length - 1];
    const catalogTree = await getCatalogTreeApi(lang as Locale, 768, undefined).catch(() => [] as ProductCategory[]);
    const categoryIndex = buildCategoryIndex(catalogTree);

    let categoryEntry = Array.from(categoryIndex.values()).find(
        e => e.node.slug === lastSegment
    );

    if (!categoryEntry) {
        const altLang = lang === 'ua' ? 'ru' : 'ua';
        const altTree = await getCatalogTreeApi(altLang as Locale, 768, undefined).catch(() => [] as ProductCategory[]);
        const altIndex = buildCategoryIndex(altTree);
        const altEntry = Array.from(altIndex.values()).find(e => e.node.slug === lastSegment);
        if (altEntry) {
            categoryEntry = categoryIndex.get(altEntry.node.id);
        }
    }

    if (categoryEntry) {
        const categoryName = categoryEntry.node.name;
        const categoryImage = resolveCategoryImageUrl(categoryEntry.node);
        const description = `${categoryName} — замовляйте з доставкою від М'ясторія.`;

        const alternates = getHreflangAlternates(`/category/${slug.join('/')}/`, lang, dynamicBaseUrl);

        return {
            title: categoryName,
            description,
            alternates: {
                canonical: alternates.canonical,
                languages: alternates.languages,
            },
            openGraph: {
                title: categoryName,
                description,
                images: categoryImage ? [{ url: categoryImage, alt: categoryName }] : undefined,
            },
            twitter: {
                card: 'summary_large_image',
                title: categoryName,
                description,
                images: categoryImage ? [categoryImage] : undefined,
            },
        };
    }

    return {};
}

export default async function DynamicCategoryPage({ params, searchParams }: DynamicCategoryPageProps) {
    const { lang, slug } = await params;
    const resolvedSearchParams = await searchParams;
    const dict = await getDictionary(lang as Locale);
    const token = await getAccessToken();

    if (!slug || slug.length === 0) {
        notFound();
    }

    const lastSegment = slug[slug.length - 1];

    // If multi-segment URL accessed (e.g. /category/parent/child), redirect 301 to single-level flat URL (/category/child)
    if (slug.length > 1) {
        redirect(`/${lang}/category/${lastSegment}`);
    }

    // 1. Fetch current catalog tree (locality-aware)
    const catalogTree = await getCatalogTreeApi(lang, 768, token ?? undefined).catch(() => [] as ProductCategory[]);
    const categoryIndex = buildCategoryIndex(catalogTree);

    const normalizeSlug = (s: string) => s.toLowerCase().replace(/y/g, 'i').replace(/-\d+$/, '').replace(/-/g, '');

    // 2. Check if category exists in current locality tree by slug
    let categoryEntry = Array.from(categoryIndex.values()).find(
        e => e.node.slug === lastSegment
    );

    // If exact slug not found, check normalized slug (e.g. steyki-2 -> steiky-2, myaso -> miaso)
    if (!categoryEntry) {
        const targetNorm = normalizeSlug(lastSegment);
        categoryEntry = Array.from(categoryIndex.values()).find(
            e => normalizeSlug(e.node.slug) === targetNorm
        );
        if (categoryEntry) {
            redirect(`/${lang}/category/${categoryEntry.node.slug}`);
        }
    }

    // If still not found by slug in target lang, fetch alt tree to find category ID!
    if (!categoryEntry) {
        const altLang = lang === 'ua' ? 'ru' : 'ua';
        const altTree = await getCatalogTreeApi(altLang, 768, token ?? undefined).catch(() => [] as ProductCategory[]);
        const altIndex = buildCategoryIndex(altTree);
        const targetNorm = normalizeSlug(lastSegment);
        const altEntry = Array.from(altIndex.values()).find(
            e => e.node.slug === lastSegment || normalizeSlug(e.node.slug) === targetNorm
        );
        if (altEntry) {
            categoryEntry = categoryIndex.get(altEntry.node.id);
            if (categoryEntry) {
                redirect(`/${lang}/category/${categoryEntry.node.slug}`);
            }
        }
    }

    // If not found under parent 768 or alt tree, check root tree (all categories)
    if (!categoryEntry) {
        const rootTree = await getCatalogTreeApi(lang, undefined, token ?? undefined).catch(() => [] as ProductCategory[]);
        const rootIndex = buildCategoryIndex(rootTree);
        const targetNorm = normalizeSlug(lastSegment);
        categoryEntry = Array.from(rootIndex.values()).find(
            e => e.node.slug === lastSegment || normalizeSlug(e.node.slug) === targetNorm
        );
        if (categoryEntry && categoryEntry.node.slug !== lastSegment) {
            redirect(`/${lang}/category/${categoryEntry.node.slug}`);
        }
    }

    if (categoryEntry) {
        const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page as string) : 1;
        const view = (resolvedSearchParams.view as 'list' | 'grid') || 'grid';
        const sort = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : undefined;
        const activeFilters = parseFilterParams(resolvedSearchParams as Record<string, string | string[] | undefined>);
        const categoryId = parseInt(categoryEntry.node.id);
        const rawParam = parseRawProductionParam(resolvedSearchParams as Record<string, string | string[] | undefined>);

        const categoryDetails = await getCategoryByIdApi(categoryId, lang, token ?? undefined).catch(() => null);
        const hasMixedRawProduction = Boolean(categoryDetails?.hasMixedRawProduction);

        const rawProduction = rawParam !== undefined
            ? rawParam
            : (hasMixedRawProduction ? false : undefined);

        const [productsResponse, popularProducts] = await Promise.all([
            getProductsApi(
                { categoryId, limit: 12, page, sort, filter: activeFilters, rawProduction },
                lang,
                token ?? undefined,
            ).catch((err) => {
                console.error("[DynamicCategoryPage] Failed to fetch category products:", err);
                return {
                    data: [],
                    per_page: 12,
                    current_page: page,
                    has_more_pages: false,
                } as ProductsResponse;
            }),
            getPopularProductsApi(undefined, 12, lang, token ?? undefined).catch(() => [] as Product[]),
        ]);
        productsResponse.current_page = page;

        const hasActiveFilters = activeFilters.length > 0 || !!sort || rawParam !== undefined;
        if (shouldRedirectForLocality(productsResponse.data.length, page, hasActiveFilters)) {
            let redirectUrl = `/${lang}/catalog`;
            if (categoryEntry.parent) {
                const parentEntry = categoryIndex.get(String(categoryEntry.parent.id));
                if (parentEntry) {
                    const parentHref = getCategoryHref(parentEntry.node);
                    redirectUrl = `/${lang}${parentHref}`;
                }
            }
            
            redirect(redirectUrl);
        }

        let faq = null;
        if (categoryDetails?.faqGroups && categoryDetails.faqGroups.length > 0) {
            const firstGroupId = parseInt(categoryDetails.faqGroups[0].id);
            faq = await getFaqQuestionsApi(firstGroupId, lang).catch(() => null);
        }

        const currentCategoryName = categoryDetails?.name || categoryEntry.node.name;

        const breadcrumbItems = buildCategoryBreadcrumbs(categoryEntry.node.id, categoryIndex);
        if (breadcrumbItems.length > 1) {
            breadcrumbItems[breadcrumbItems.length - 1] = { label: currentCategoryName };
        }

        const subcategoryItems = (categoryEntry.node.children ?? []).map(sub => ({
            name: sub.name,
            image: resolveCategoryImageUrl(sub) || '/icons/icon-category.svg',
            href: getCategoryHref(sub),
        }));

        return (
            <main>
                <CatalogContent
                    lang={lang as Locale}
                    dict={dict}
                    initialProducts={productsResponse}
                    categoryId={categoryId}
                    categoryName={currentCategoryName}
                    breadcrumbItems={breadcrumbItems}
                    subcategoryItems={subcategoryItems.length > 0 ? subcategoryItems : undefined}
                    view={view}
                    sortBy={resolvedSearchParams.sort as string || undefined}
                    popularProducts={popularProducts}
                    activeFilters={activeFilters}
                    recommendedProducts={categoryDetails?.recommendedProducts}
                    bannerUrl={categoryDetails?.banner?.size1x}
                    faq={faq}
                    isSubcategory={categoryEntry.level > 1}
                    hasMixedRawProduction={Boolean(categoryDetails?.hasMixedRawProduction)}
                />
            </main>
        );
    }

    // 3. If category not found locally, check global tree
    const globalTree = await getCatalogTreeApi(lang, 768, undefined).catch(() => [] as ProductCategory[]);
    const globalIndex = buildCategoryIndex(globalTree);
    const globalCategoryEntry = Array.from(globalIndex.values()).find(
        e => e.node.slug === lastSegment
    );

    if (globalCategoryEntry) {
        redirect(`/${lang}/catalog`);
    }

    notFound();
}

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
    return [];
}
