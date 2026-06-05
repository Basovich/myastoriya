import { notFound } from 'next/navigation';
import { getDictionary } from '@/i18n/get-dictionary';
import { Locale } from '@/i18n/config';
import CatalogContent from '@/app/pages/Catalog/CatalogContent';
import { getCatalogTreeApi, getProductsApi, getCategoryByIdApi, getFaqQuestionsApi } from '@/lib/graphql';
import { buildCategoryIndex, getCategoryHref } from '@/utils/category-url';
import { resolveCategoryImageUrl } from '@/lib/graphql/queries/products';

interface CategoryCatalogPageProps {
    params: Promise<{ lang: string; category: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CategoryCatalogPage({ params, searchParams }: CategoryCatalogPageProps) {
    const { lang, category: categorySlug } = await params;
    const resolvedSearchParams = await searchParams;
    const dict = await getDictionary(lang as Locale);

    const catalogTree = await getCatalogTreeApi(lang);
    const categoryIndex = buildCategoryIndex(catalogTree);

    // Find level-3 category by slug across the full tree
    const entry = Array.from(categoryIndex.values()).find(
        e => e.node.slug === categorySlug && e.level === 3,
    );

    // Fallback: also check level-2 (some slugs may live at level 2 and be accessed via /catalog/)
    const entryFallback = entry ?? Array.from(categoryIndex.values()).find(
        e => e.node.slug === categorySlug,
    );

    if (!entryFallback) notFound();

    const { node: matchedCat, parent, grandParent } = entryFallback;

    const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page as string) : 1;
    const view = (resolvedSearchParams.view as 'list' | 'grid') || 'list';
    const sort = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : undefined;

    const categoryId = parseInt(matchedCat.id);
    const [productsResponse, categoryDetails] = await Promise.all([
        getProductsApi(
            { categoryId, limit: 12 * page, page: 1, sort },
            lang,
        ),
        getCategoryByIdApi(categoryId, lang),
    ]);
    productsResponse.current_page = page;

    // Завантажуємо FAQ для першої групи (якщо є)
    let faq = null;
    if (categoryDetails?.faqGroups && categoryDetails.faqGroups.length > 0) {
        const firstGroupId = parseInt(categoryDetails.faqGroups[0].id);
        faq = await getFaqQuestionsApi(firstGroupId, lang);
    }

    // Build breadcrumbs: Головна > [GrandParent] > [Parent] > CurrentCategory
    const breadcrumbItems: { label: string; href?: string }[] = [
        { label: 'Головна', href: '/' },
    ];
    if (grandParent) {
        breadcrumbItems.push({ label: grandParent.name, href: `/${grandParent.slug}` });
    }
    if (parent) {
        const parentHref = grandParent
            ? `/${grandParent.slug}/${parent.slug}`
            : `/${parent.slug}`;
        breadcrumbItems.push({ label: parent.name, href: parentHref });
    }
    breadcrumbItems.push({ label: matchedCat.name });

    // Sibling categories of the 3rd level for CategoryCircles
    const subcategoryItems = parent
        ? (parent.children ?? []).map(sub => ({
              name: sub.name,
              image: resolveCategoryImageUrl(sub) || '/icons/icon-category.svg',
              href: getCategoryHref(sub, parent, grandParent),
          }))
        : [];

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
                recommendedProducts={categoryDetails?.recommendedProducts}
                bannerUrl={categoryDetails?.banner?.size1x}
                faq={faq}
            />
        </main>
    );
}
