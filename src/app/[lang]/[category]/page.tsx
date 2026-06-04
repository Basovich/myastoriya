import { notFound, redirect } from 'next/navigation';
import { getDictionary } from '@/i18n/get-dictionary';
import { Locale } from '@/i18n/config';
import CatalogContent from '@/app/pages/Catalog/CatalogContent';
import { getCatalogTreeApi, getProductsApi, getPopularProductsApi } from '@/lib/graphql';
import { buildCategoryIndex, getCategoryHref } from '@/utils/category-url';
import { resolveCategoryImageUrl } from '@/lib/graphql/queries/products';
import type { CategoryCircleItem } from '@/app/components/CategoryCircles/CategoryCircles';
import { parseFilterParams } from '@/utils/filter-params';

interface CategoryPageProps {
    params: Promise<{ lang: string; category: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
    const { lang, category: categorySlug } = await params;
    const resolvedSearchParams = await searchParams;
    const dict = await getDictionary(lang as Locale);

    const catalogTree = await getCatalogTreeApi(lang);
    const categoryIndex = buildCategoryIndex(catalogTree);

    // Find level-1 category by slug in the current locale tree
    let matchedCat = catalogTree.find(c => c.slug === categorySlug);

    // Cross-locale fallback: slug may come from a different locale (e.g. after language switch).
    // Search the slug in all other locale trees, find the category id, then redirect to the
    // correct slug for the current locale.
    if (!matchedCat) {
        const otherLocales = ['ua', 'ru'].filter(l => l !== lang);
        for (const otherLang of otherLocales) {
            const otherTree = await getCatalogTreeApi(otherLang);
            const otherCat = otherTree.find(c => c.slug === categorySlug);
            if (otherCat) {
                const localizedCat = catalogTree.find(c => c.id === otherCat.id);
                if (localizedCat) {
                    const langPrefix = lang === 'ua' ? '' : `/${lang}`;
                    redirect(`${langPrefix}/${localizedCat.slug}`);
                }
                break;
            }
        }
        notFound();
    }

    const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page as string) : 1;
    const view = (resolvedSearchParams.view as 'list' | 'grid') || 'grid';
    const sort = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : undefined;

    // Парсимо активні фільтри з URL
    const activeFilters = parseFilterParams(resolvedSearchParams as Record<string, string | string[] | undefined>);

    const categoryId = parseInt(matchedCat.id);

    const [productsResponse, popularProducts] = await Promise.all([
        getProductsApi(
            { categoryId, limit: 12 * page, page: 1, sort, filter: activeFilters },
            lang,
        ),
        getPopularProductsApi(undefined, 12, lang),
    ]);
    productsResponse.current_page = page;

    // Breadcrumbs: Головна > CategoryName (no link on last item)
    const breadcrumbItems = [
        { label: 'Головна', href: '/' },
        { label: matchedCat.name },
    ];

    // Subcategories (level 2) for CategoryCircles
    const subcategoryItems: CategoryCircleItem[] = (matchedCat.children ?? []).map(sub => ({
        name: sub.name,
        image: resolveCategoryImageUrl(sub) || '/icons/icon-category.svg',
        href: getCategoryHref(sub, matchedCat),
    }));

    return (
        <main>
            <CatalogContent
                lang={lang as Locale}
                dict={dict}
                initialProducts={productsResponse}
                categoryId={categoryId}
                categoryName={matchedCat.name}
                breadcrumbItems={breadcrumbItems}
                subcategoryItems={subcategoryItems.length > 0 ? subcategoryItems : undefined}
                view={view}
                sortBy={resolvedSearchParams.sort as string || undefined}
                popularProducts={popularProducts}
                activeFilters={activeFilters}
            />
        </main>
    );
}

// This page is generated on-demand (ISR)
export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
    return [];
}
