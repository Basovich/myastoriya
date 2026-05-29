import { notFound } from 'next/navigation';
import { getDictionary } from '@/i18n/get-dictionary';
import { Locale } from '@/i18n/config';
import CatalogContent from '@/app/pages/Catalog/CatalogContent';
import { getCatalogTreeApi, getProductsApi } from '@/lib/graphql';
import { buildCategoryIndex, getCategoryHref } from '@/utils/category-url';
import { resolveCategoryImageUrl } from '@/lib/graphql/queries/products';
import type { CategoryCircleItem } from '@/app/components/CategoryCircles/CategoryCircles';

interface SubcategoryPageProps {
    params: Promise<{ lang: string; category: string; subcategory: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SubcategoryPage({ params, searchParams }: SubcategoryPageProps) {
    const { lang, category: categorySlug, subcategory: subcategorySlug } = await params;
    const resolvedSearchParams = await searchParams;
    const dict = await getDictionary(lang as Locale);

    const catalogTree = await getCatalogTreeApi(lang);
    const categoryIndex = buildCategoryIndex(catalogTree);

    // Find level-1 parent by slug
    const parentCat = catalogTree.find(c => c.slug === categorySlug);
    if (!parentCat) notFound();

    // Find level-2 child by slug
    const matchedCat = (parentCat.children ?? []).find(c => c.slug === subcategorySlug);
    if (!matchedCat) notFound();

    const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page as string) : 1;
    const view = (resolvedSearchParams.view as 'list' | 'grid') || 'list';
    const sort = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : undefined;

    const productsResponse = await getProductsApi(
        { categoryId: parseInt(matchedCat.id), limit: 12, page, sort },
        lang,
    );

    // Breadcrumbs: Головна > ParentName > SubcategoryName
    const breadcrumbItems = [
        { label: 'Головна', href: '/' },
        { label: parentCat.name, href: `/${parentCat.slug}` },
        { label: matchedCat.name },
    ];

    // Subcategories (level 3) for CategoryCircles
    const subcategoryItems: CategoryCircleItem[] = (matchedCat.children ?? []).map(sub => ({
        name: sub.name,
        image: resolveCategoryImageUrl(sub) || '/icons/icon-category.svg',
        href: getCategoryHref(sub, matchedCat, parentCat),
    }));

    return (
        <main>
            <CatalogContent
                lang={lang as Locale}
                dict={dict}
                initialProducts={productsResponse}
                categoryName={matchedCat.name}
                breadcrumbItems={breadcrumbItems}
                subcategoryItems={subcategoryItems.length > 0 ? subcategoryItems : undefined}
                view={view}
                sortBy={resolvedSearchParams.sort as string || undefined}
            />
        </main>
    );
}

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
    return [];
}
