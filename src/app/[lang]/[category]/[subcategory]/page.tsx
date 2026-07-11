import { notFound, redirect } from 'next/navigation';
import { getDictionary } from '@/i18n/get-dictionary';
import { Locale } from '@/i18n/config';
import CatalogContent from '@/app/pages/Catalog/CatalogContent';
import { getCatalogTreeApi, getProductsApi, getPopularProductsApi, getCategoryByIdApi, getFaqQuestionsApi } from '@/lib/graphql';
import { parseFilterParams } from '@/utils/filter-params';

interface SubcategoryPageProps {
    params: Promise<{ lang: string; category: string; subcategory: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SubcategoryPage({ params, searchParams }: SubcategoryPageProps) {
    const { lang, category: categorySlug, subcategory: subcategorySlug } = await params;
    const resolvedSearchParams = await searchParams;
    const dict = await getDictionary(lang as Locale);
    const catalogTree = await getCatalogTreeApi(lang);

    // Find level-1 parent by slug in the current locale tree
    const parentCat = catalogTree.find(c => c.slug === categorySlug);

    // Cross-locale fallback for parent slug (bidirectional: UA↔RU)
    if (!parentCat) {
        const otherLocales = ['ua', 'ru'].filter(l => l !== lang);
        for (const otherLang of otherLocales) {
            const otherTree = await getCatalogTreeApi(otherLang);
            const otherParent = otherTree.find(c => c.slug === categorySlug);
            if (otherParent) {
                const localizedParent = catalogTree.find(c => c.id === otherParent.id);
                if (localizedParent) {
                    // Also translate the subcategory slug
                    const otherSub = (otherParent.children ?? []).find(c => c.slug === subcategorySlug);
                    const localizedSub = otherSub
                        ? (localizedParent.children ?? []).find(c => c.id === otherSub.id)
                        : null;
                    const langPrefix = lang === 'ua' ? '' : `/${lang}`;
                    redirect(`${langPrefix}/${localizedParent.slug}/${localizedSub?.slug ?? subcategorySlug}`);
                }
                break;
            }
        }
        notFound();
    }

    // Find level-2 child by slug
    const matchedCat = (parentCat.children ?? []).find(c => c.slug === subcategorySlug);

    // Cross-locale fallback for subcategory slug (bidirectional: UA↔RU)
    if (!matchedCat) {
        const otherLocales = ['ua', 'ru'].filter(l => l !== lang);
        for (const otherLang of otherLocales) {
            const otherTree = await getCatalogTreeApi(otherLang);
            const otherParent = otherTree.find(c => c.id === parentCat.id);
            const otherSub = (otherParent?.children ?? []).find(c => c.slug === subcategorySlug);
            if (otherSub) {
                const localizedSub = (parentCat.children ?? []).find(c => c.id === otherSub.id);
                if (localizedSub) {
                    const langPrefix = lang === 'ua' ? '' : `/${lang}`;
                    redirect(`${langPrefix}/${parentCat.slug}/${localizedSub.slug}`);
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

    const [productsResponse, popularProducts, categoryDetails] = await Promise.all([
        getProductsApi(
            { categoryId, limit: 12, page, sort, filter: activeFilters },
            lang,
        ),
        getPopularProductsApi(undefined, 12, lang),
        getCategoryByIdApi(categoryId, lang),
    ]);
    productsResponse.current_page = page;

    // Завантажуємо FAQ для першої групи (якщо є)
    let faq = null;
    if (categoryDetails?.faqGroups && categoryDetails.faqGroups.length > 0) {
        const firstGroupId = parseInt(categoryDetails.faqGroups[0].id);
        faq = await getFaqQuestionsApi(firstGroupId, lang);
    }

    // Breadcrumbs: Головна > ParentName > SubcategoryName
    const breadcrumbItems = [
        { label: 'Головна', href: '/' },
        { label: parentCat.name, href: `/${parentCat.slug}` },
        { label: matchedCat.name },
    ];

    return (
        <main>
            <CatalogContent
                lang={lang as Locale}
                dict={dict}
                initialProducts={productsResponse}
                categoryId={categoryId}
                categoryName={matchedCat.name}
                breadcrumbItems={breadcrumbItems}
                view={view}
                sortBy={resolvedSearchParams.sort as string || undefined}
                popularProducts={popularProducts}
                activeFilters={activeFilters}
                recommendedProducts={categoryDetails?.recommendedProducts}
                bannerUrl={categoryDetails?.banner?.size1x}
                faq={faq}
                isSubcategory={true}
            />
        </main>
    );
}

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
    return [];
}
