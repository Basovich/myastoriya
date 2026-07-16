import { notFound, redirect } from 'next/navigation';
import { getDictionary } from '@/i18n/get-dictionary';
import { Locale } from '@/i18n/config';
import CatalogContent from '@/app/pages/Catalog/CatalogContent';
import { getCatalogTreeApi, getProductsApi, getPopularProductsApi, getCategoryByIdApi, getFaqQuestionsApi } from '@/lib/graphql';
import { getCategoryHref, shouldRedirectForLocality } from '@/utils/category-url';
import { resolveCategoryImageUrl } from '@/lib/graphql/queries/products';
import type { CategoryCircleItem } from '@/app/components/CategoryCircles/CategoryCircles';
import { parseFilterParams } from '@/utils/filter-params';
import { getAccessToken } from '@/app/actions/authActions';

interface CategoryPageProps {
    params: Promise<{ lang: string; category: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
    const { lang, category: categorySlug } = await params;
    const resolvedSearchParams = await searchParams;
    const dict = await getDictionary(lang as Locale);

    const token = await getAccessToken();

    const catalogTree = await getCatalogTreeApi(lang, 768, token ?? undefined);

    let matchedCat = catalogTree.find(c => c.slug === categorySlug);

    // Якщо не знайдено, можливо категорія існує, але прихована (відфільтрована бекендом) для обраного міста.
    // Перевіряємо в глобальному дереві категорій (без токена, тобто для дефолтного міста)
    if (!matchedCat) {
        const globalTree = await getCatalogTreeApi(lang, 768, undefined);
        const existsGlobally = globalTree.find(c => c.slug === categorySlug);
        
        if (existsGlobally) {
            // Категорія існує на сайті, але прихована для міста. Редиректимо на каталог.
            const langPrefix = lang === 'ua' ? '' : `/${lang}`;
            redirect(`${langPrefix}/catalog`);
        }
    }

    // Cross-locale fallback: slug may come from a different locale (e.g. after language switch).
    // Search the slug in all other locale trees, find the category id, then redirect to the
    // correct slug for the current locale.
    if (!matchedCat) {
        const otherLocales = ['ua', 'ru'].filter(l => l !== lang);
        for (const otherLang of otherLocales) {
            // Використовуємо глобальне дерево для крос-локалізаційного пошуку, оскільки категорія може бути прихована в іншій локалі для обраного міста
            const otherGlobalTree = await getCatalogTreeApi(otherLang, 768, undefined);
            const otherCat = otherGlobalTree.find(c => c.slug === categorySlug);
            if (otherCat) {
                const globalTree = await getCatalogTreeApi(lang, 768, undefined);
                const localizedCat = globalTree.find(c => c.id === otherCat.id);
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

    const [productsResponse, popularProducts, categoryDetails] = await Promise.all([
        getProductsApi(
            { categoryId, limit: 12, page, sort, filter: activeFilters },
            lang,
            token ?? undefined,
        ),
        getPopularProductsApi(undefined, 12, lang, token ?? undefined),
        getCategoryByIdApi(categoryId, lang, token ?? undefined),
    ]);
    productsResponse.current_page = page;

    // Якщо 0 товарів для обраного міста (і немає активних фільтрів) — редирект на головний каталог
    const hasActiveFilters = activeFilters.length > 0 || !!sort;
    if (shouldRedirectForLocality(productsResponse.data.length, page, hasActiveFilters)) {
        const langPrefix = lang === 'ua' ? '' : `/${lang}`;
        redirect(`${langPrefix}/catalog`);
    }

    // Завантажуємо FAQ для першої групи (якщо є)
    let faq = null;
    if (categoryDetails?.faqGroups && categoryDetails.faqGroups.length > 0) {
        const firstGroupId = parseInt(categoryDetails.faqGroups[0].id);
        faq = await getFaqQuestionsApi(firstGroupId, lang);
    }

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
                recommendedProducts={categoryDetails?.recommendedProducts}
                bannerUrl={categoryDetails?.banner?.size1x}
                faq={faq}
            />
        </main>
    );
}

// This page is generated on-demand (ISR)
export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
    return [];
}
