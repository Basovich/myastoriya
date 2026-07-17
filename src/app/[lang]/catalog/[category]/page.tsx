import { notFound, redirect } from 'next/navigation';
import { getDictionary } from '@/i18n/get-dictionary';
import { Locale } from '@/i18n/config';
import CatalogContent from '@/app/pages/Catalog/CatalogContent';
import { getCatalogTreeApi, getProductsApi, getCategoryByIdApi, getFaqQuestionsApi, ProductsResponse, ProductCategory } from '@/lib/graphql';
import { buildCategoryIndex, shouldRedirectForLocality } from '@/utils/category-url';
import { getAccessToken } from '@/app/actions/authActions';

interface CategoryCatalogPageProps {
    params: Promise<{ lang: string; category: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CategoryCatalogPage({ params, searchParams }: CategoryCatalogPageProps) {
    const { lang, category: categorySlug } = await params;
    const resolvedSearchParams = await searchParams;
    const dict = await getDictionary(lang as Locale);

    const token = await getAccessToken();

    const catalogTree = await getCatalogTreeApi(lang, 768, token ?? undefined).catch(() => [] as ProductCategory[]);
    const categoryIndex = buildCategoryIndex(catalogTree);

    // Find level-3 category by slug across the full tree
    const entry = Array.from(categoryIndex.values()).find(
        e => e.node.slug === categorySlug && e.level === 3,
    );

    // Fallback: also check level-2 (some slugs may live at level 2 and be accessed via /catalog/)
    let entryFallback = entry ?? Array.from(categoryIndex.values()).find(
        e => e.node.slug === categorySlug,
    );

    if (!entryFallback) {
        // Перевіряємо в глобальному дереві категорій
        const globalTree = await getCatalogTreeApi(lang, 768, undefined).catch(() => [] as ProductCategory[]);
        const globalIndex = buildCategoryIndex(globalTree);
        const globalEntry = Array.from(globalIndex.values()).find(
            e => e.node.slug === categorySlug,
        );
        if (globalEntry) {
            // Категорія прихована для міста. Редиректимо на каталог.
            const langPrefix = lang === 'ua' ? '' : `/${lang}`;
            redirect(`${langPrefix}/catalog`);
        }
    }

    if (!entryFallback) notFound();

    const { node: matchedCat, parent, grandParent } = entryFallback;

    const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page as string) : 1;
    const view = (resolvedSearchParams.view as 'list' | 'grid') || 'grid';
    const sort = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : undefined;

    const categoryId = parseInt(matchedCat.id);
    
    let productsResponse: ProductsResponse = {
        data: [],
        per_page: 12,
        current_page: page,
        has_more_pages: false,
    };
    let categoryDetails = null;

    try {
        const [products, details] = await Promise.all([
            getProductsApi(
                { categoryId, limit: 12, page, sort },
                lang,
                token ?? undefined,
            ).catch((err) => {
                console.error("[CategoryCatalogPage] Failed to fetch products:", err);
                return null;
            }),
            getCategoryByIdApi(categoryId, lang, token ?? undefined).catch((err) => {
                console.error("[CategoryCatalogPage] Failed to fetch category details:", err);
                return null;
            }),
        ]);
        if (products) {
            productsResponse = products;
        }
        categoryDetails = details;
    } catch (err) {
        console.error("[CategoryCatalogPage] Parallel fetch failed:", err);
    }
    productsResponse.current_page = page;

    // Якщо 0 товарів для обраного міста — редирект на головний каталог (гарантовано має товари)
    if (shouldRedirectForLocality(productsResponse.data.length, page, !!sort)) {
        const langPrefix = lang === 'ua' ? '' : `/${lang}`;
        redirect(`${langPrefix}/catalog`);
    }

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

    return (
        <main>
            <CatalogContent
                lang={lang as Locale}
                dict={dict}
                initialProducts={productsResponse}
                categoryId={parseInt(matchedCat.id)}
                categoryName={matchedCat.name}
                breadcrumbItems={breadcrumbItems}
                view={view}
                sortBy={resolvedSearchParams.sort as string || undefined}
                recommendedProducts={categoryDetails?.recommendedProducts}
                bannerUrl={categoryDetails?.banner?.size1x}
                faq={faq}
                isSubcategory={true}
            />
        </main>
    );
}
