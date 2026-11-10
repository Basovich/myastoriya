import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { getDictionary } from '@/i18n/get-dictionary';
import { Locale } from '@/i18n/config';
import CatalogContent from '@/app/pages/Catalog/CatalogContent';
import {
    getCatalogTreeApi,
    getProductsApi,
    getPopularProductsApi,
    getCategoryByIdApi,
    getFaqQuestionsApi,
    getProductsFilterApi,
    resolveCategoryImageUrl,
    ProductCategory,
    Product,
    ProductsResponse,
} from '@/lib/graphql';
import { buildCategoryIndex, buildCategoryBreadcrumbs, getCategoryHref, shouldRedirectForLocality } from '@/utils/category-url';
import { parseFilterParams, parseRawProductionParam } from '@/utils/filter-params';
import { extractFilterSegment, getCategoryFilterContext, getCategoryFilterMinPrice, getCategoryRobots } from '@/utils/catalog-filter-seo';
import { buildCatalogFilterSeoTexts } from '@/i18n/catalog-seo';
import { getAccessToken } from '@/app/actions/authActions';
import { getHreflangAlternates, getDynamicBaseUrl, fetchSeoMetadataByUrl, parsePageNum, formatTitleWithPage, buildOpenGraphMetadata, generateBreadcrumbJsonLd, setRequestBreadcrumbJsonLd, resolvePageHreflangLinks } from '@/utils/seo';
import { getRedirectByUrlApi } from '@/lib/graphql/queries/seo';
import HreflangLinks from '@/app/components/HreflangLinks/HreflangLinks';

interface DynamicCategoryPageProps {
    params: Promise<{ lang: string; slug: string[] }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params, searchParams }: DynamicCategoryPageProps): Promise<Metadata> {
    const { lang, slug } = await params;
    if (!slug || slug.length === 0) return {};

    const resolvedSearchParams = await searchParams;
    const pageNum = parsePageNum(resolvedSearchParams?.page);

    const headersList = await headers();
    const dynamicBaseUrl = getDynamicBaseUrl(headersList);

    // Підтримуються лише `/category/<slug>/` та `/category/<slug>/<filters>/`
    const filterSegment = extractFilterSegment(slug);
    if (filterSegment === undefined) return {};

    const lastSegment = slug[0];
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

        const categoryId = parseInt(categoryEntry.node.id);
        const filterCtx = filterSegment
            ? await getCategoryFilterContext(categoryId, categoryEntry.node.slug, filterSegment, lang)
            : null;
        if (filterCtx && !filterCtx.parsed.isValid) return {};

        const queryFilters = parseFilterParams(resolvedSearchParams as Record<string, string | string[] | undefined>);
        const hasQueryListFilters = queryFilters.some(f => (f.values?.length ?? 0) > 0);
        const hasFilters = Boolean(filterCtx?.parsed.hasFilters) || hasQueryListFilters;
        const isSeoFilterPage = Boolean(filterCtx?.parsed.isSingleSeoFilter) && !hasQueryListFilters;

        const categoryPath = `/category/${categoryEntry.node.slug}/`;
        const pagePath = filterCtx?.parsed.hasFilters
            ? `${categoryPath}${filterCtx.parsed.canonicalFilterPath}/`
            : categoryPath;

        const seoData = await fetchSeoMetadataByUrl(`/${lang}${categoryPath}`, lang, {
            h1: categoryName,
        });

        let pageTitleBase = seoData.title || categoryName;
        let pageDescription = seoData.description;
        const details = filterCtx?.parsed.singleSeoDetails;
        if (isSeoFilterPage && details) {
            const minPrice = await getCategoryFilterMinPrice(categoryId, categoryEntry.node.slug, filterSegment as string, lang, await getAccessToken() ?? undefined);
            const seoTexts = buildCatalogFilterSeoTexts(
                lang as Locale,
                categoryName,
                lang === 'ru' ? details.seoValueLabelRu : details.seoValueLabelUa,
                minPrice,
            );
            pageTitleBase = seoTexts.title;
            pageDescription = seoTexts.description;
        }

        const alternates = getHreflangAlternates(pagePath, lang, dynamicBaseUrl, pageNum);
        const finalTitle = formatTitleWithPage(pageTitleBase, pageNum, lang);
        const canonicalUrl = hasFilters || pageNum > 1 ? alternates.canonical : (seoData.canonical || alternates.canonical);
        const pageRobots = getCategoryRobots({
            pageNum,
            hasFilters,
            isSingleSeoFilter: isSeoFilterPage,
            backendNoindex: Boolean(seoData.noindex),
        });

        const breadcrumbItems = buildCategoryBreadcrumbs(categoryEntry.node.id, categoryIndex, lang);
        if (breadcrumbItems.length > 1) {
            breadcrumbItems[breadcrumbItems.length - 1] = { label: categoryName };
        }
        const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbItems, lang, canonicalUrl, dynamicBaseUrl);
        setRequestBreadcrumbJsonLd(breadcrumbJsonLd);

        return {
            title: finalTitle,
            description: pageDescription,
            robots: pageRobots,
            openGraph: buildOpenGraphMetadata({
                title: finalTitle,
                description: pageDescription,
                canonicalUrl,
                lang,
                image: categoryImage,
                type: 'website',
            }),
            twitter: {
                card: 'summary_large_image',
                title: finalTitle,
                description: pageDescription,
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

    // `/category/<slug>/` або `/category/<slug>/<filters>/`; інші багатосегментні URL
    // (наприклад, /category/parent/child) редиректимо на плоский `/category/child/`
    const filterSegment = extractFilterSegment(slug);
    const lastSegment = filterSegment === undefined ? slug[slug.length - 1] : slug[0];

    if (filterSegment === undefined) {
        redirect(`/${lang}/category/${lastSegment}/`);
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
            redirect(`/${lang}/category/${categoryEntry.node.slug}/`);
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
                redirect(`/${lang}/category/${categoryEntry.node.slug}/`);
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
            redirect(`/${lang}/category/${categoryEntry.node.slug}/`);
        }
    }

    if (categoryEntry) {
        const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page as string) : 1;
        const view = (resolvedSearchParams.view as 'list' | 'grid') || 'grid';
        const sort = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : undefined;
        const categoryId = parseInt(categoryEntry.node.id);
        const queryFilters = parseFilterParams(resolvedSearchParams as Record<string, string | string[] | undefined>);

        // Фільтри зі шляху URL (slug → числові ключі бекенду). Невідомий фільтр або значення — 404
        const filterCtx = filterSegment
            ? await getCategoryFilterContext(categoryId, categoryEntry.node.slug, filterSegment, lang)
            : null;
        if (filterCtx && !filterCtx.parsed.isValid) {
            notFound();
        }
        if (filterCtx && !filterCtx.parsed.isNormalized) {
            // Той самий набір фільтрів в іншому порядку — переводимо на канонічний порядок
            const search = new URLSearchParams();
            Object.entries(resolvedSearchParams).forEach(([key, value]) => {
                if (typeof value === 'string') search.set(key, value);
            });
            const query = search.toString();
            permanentRedirect(`/${lang}/category/${categoryEntry.node.slug}/${filterCtx.parsed.canonicalFilterPath}/${query ? `?${query}` : ''}`);
        }
        const pathFilters = filterCtx?.parsed.filterState ?? [];
        const activeFilters = [...pathFilters, ...queryFilters];
        const hasQueryListFilters = queryFilters.some(f => (f.values?.length ?? 0) > 0);
        const isSeoFilterPage = Boolean(filterCtx?.parsed.isSingleSeoFilter) && !hasQueryListFilters;
        const rawParam = parseRawProductionParam(resolvedSearchParams as Record<string, string | string[] | undefined>);

        const categoryDetails = await getCategoryByIdApi(categoryId, lang, token ?? undefined).catch(() => null);
        const hasMixedRawProduction = Boolean(categoryDetails?.hasMixedRawProduction);

        const isRawPath = lastSegment.includes('siri') || lastSegment.includes('syry');
        const rawProduction = rawParam !== undefined
            ? rawParam
            : (hasMixedRawProduction ? isRawPath : undefined);

        const [productsResponse, popularProducts, filterData] = await Promise.all([
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
            getProductsFilterApi(categoryId, lang, activeFilters).catch(() => null),
        ]);
        productsResponse.current_page = page;

        const initialTotalItems = filterData?.productsCount || undefined;

        const hasActiveFilters = activeFilters.length > 0 || !!sort || rawParam !== undefined;
        if (shouldRedirectForLocality(productsResponse.data.length, page, hasActiveFilters)) {
            let redirectUrl = `/${lang}/catalog/`;
            if (categoryEntry.parent) {
                const parentEntry = categoryIndex.get(String(categoryEntry.parent.id));
                if (parentEntry) {
                    const parentHref = getCategoryHref(parentEntry.node);
                    redirectUrl = `/${lang}${parentHref}`;
                }
            }
            if (!redirectUrl.endsWith('/')) {
                redirectUrl += '/';
            }
            
            redirect(redirectUrl);
        }

        const pageNum = parsePageNum(resolvedSearchParams?.page);
        const hasPagination = pageNum > 1;
        const hasSorting = Boolean(sort);
        const hasFilters = activeFilters.length > 0 || rawParam !== undefined;
        const isMainCategoryPage = !hasPagination && !hasSorting && !hasFilters;

        let faq = null;
        if (isMainCategoryPage && categoryDetails?.faqGroups && categoryDetails.faqGroups.length > 0) {
            const firstGroupId = parseInt(categoryDetails.faqGroups[0].id);
            faq = await getFaqQuestionsApi(firstGroupId, lang).catch(() => null);
        }

        const currentCategoryName = categoryDetails?.name || categoryEntry.node.name;

        // H1 / крихти SEO-сторінки фільтра: [Категорія] [Значення фільтра]
        const filterDetails = filterCtx?.parsed.singleSeoDetails;
        const seoTexts = isSeoFilterPage && filterDetails
            ? buildCatalogFilterSeoTexts(
                lang as Locale,
                categoryEntry.node.name,
                lang === 'ru' ? filterDetails.seoValueLabelRu : filterDetails.seoValueLabelUa,
                null,
            )
            : null;

        const breadcrumbItems = buildCategoryBreadcrumbs(categoryEntry.node.id, categoryIndex, lang);
        if (seoTexts) {
            // Головна → ... → Категорія (посилання) → H1 поточної сторінки
            breadcrumbItems.push({ label: seoTexts.h1 });
        } else if (breadcrumbItems.length > 1) {
            breadcrumbItems[breadcrumbItems.length - 1] = { label: currentCategoryName };
        }

        const subcategoryItems = (categoryEntry.node.children ?? []).map(sub => ({
            name: sub.name,
            image: resolveCategoryImageUrl(sub) || '/icons/icon-category.svg',
            href: getCategoryHref(sub),
        }));

        const categoryPath = `/category/${categoryEntry.node.slug}/`;
        const pagePath = filterCtx?.parsed.hasFilters
            ? `${categoryPath}${filterCtx.parsed.canonicalFilterPath}/`
            : categoryPath;
        const dynamicBaseUrl = getDynamicBaseUrl(await headers());
        const [seoData, hreflangLinks] = await Promise.all([
            fetchSeoMetadataByUrl(`/${lang}${categoryPath}`, lang, {
                title: '',
                description: '',
                h1: currentCategoryName,
            }),
            filterCtx?.parsed.hasFilters || hasQueryListFilters
                ? Promise.resolve(getHreflangAlternates(pagePath, lang, dynamicBaseUrl, pageNum))
                : resolvePageHreflangLinks(
                    categoryPath,
                    lang,
                    { title: '', description: '', h1: '' },
                    dynamicBaseUrl,
                    pageNum,
                ),
        ]);

        return (
            <main>
                <HreflangLinks canonical={hreflangLinks.canonical} languages={hreflangLinks.languages} />
                <CatalogContent
                    lang={lang as Locale}
                    dict={dict}
                    initialProducts={productsResponse}
                    categoryId={categoryId}
                    categoryName={currentCategoryName}
                    h1={seoTexts?.h1 || seoData.h1 || currentCategoryName}
                    breadcrumbItems={breadcrumbItems}
                    subcategoryItems={subcategoryItems.length > 0 ? subcategoryItems : undefined}
                    view={view}
                    sortBy={resolvedSearchParams.sort as string || undefined}
                    popularProducts={popularProducts}
                    filterBlocks={filterData?.blocks ?? []}
                    activeFilters={activeFilters}
                    recommendedProducts={categoryDetails?.recommendedProducts}
                    bannerUrl={categoryDetails?.banner?.size1x}
                    faq={faq}
                    isSubcategory={categoryEntry.level > 1}
                    hasMixedRawProduction={Boolean(categoryDetails?.hasMixedRawProduction)}
                    initialTotalItems={initialTotalItems}
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
        redirect(`/${lang}/catalog/`);
    }

    // Перевіряємо наявність 301 редиректу з бекенду за URL категорії
    const currentPath = `/${lang}/category/${slug.join('/')}/`;
    const redirectTarget = await getRedirectByUrlApi(currentPath, lang);
    if (redirectTarget) {
        permanentRedirect(redirectTarget);
    }

    notFound();
}

export const dynamic = 'force-dynamic';
