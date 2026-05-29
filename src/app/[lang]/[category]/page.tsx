import { notFound } from 'next/navigation';
import { getDictionary } from '@/i18n/get-dictionary';
import { Locale } from '@/i18n/config';
import CatalogContent from '@/app/pages/Catalog/CatalogContent';
import { getCatalogTreeApi, getProductsApi } from '@/lib/graphql';
import { buildCategoryIndex, getCategoryHref } from '@/utils/category-url';
import { resolveCategoryImageUrl } from '@/lib/graphql/queries/products';
import type { CategoryCircleItem } from '@/app/components/CategoryCircles/CategoryCircles';

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

    // Find level-1 category by slug
    const matchedCat = catalogTree.find(c => c.slug === categorySlug);
    if (!matchedCat) notFound();

    const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page as string) : 1;
    const view = (resolvedSearchParams.view as 'list' | 'grid') || 'grid';
    const sort = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : undefined;

    const productsResponse = await getProductsApi(
        { categoryId: parseInt(matchedCat.id), limit: 12 * page, page: 1, sort },
        lang,
    );
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
                categoryId={parseInt(matchedCat.id)}
                categoryName={matchedCat.name}
                breadcrumbItems={breadcrumbItems}
                subcategoryItems={subcategoryItems.length > 0 ? subcategoryItems : undefined}
                view={view}
                sortBy={resolvedSearchParams.sort as string || undefined}
                hideCategorySwitcher={true}
            />
        </main>
    );
}

// This page is generated on-demand (ISR)
export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
    return [];
}
