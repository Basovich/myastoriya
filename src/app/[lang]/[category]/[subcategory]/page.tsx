import { notFound, redirect } from 'next/navigation';
import { getDictionary } from '@/i18n/get-dictionary';
import { Locale } from '@/i18n/config';
import CatalogContent from '@/app/pages/Catalog/CatalogContent';
import { getCatalogTreeApi, getProductsApi, getPopularProductsApi, getCategoryByIdApi, getFaqQuestionsApi } from '@/lib/graphql';
import { shouldRedirectForLocality } from '@/utils/category-url';
import { parseFilterParams } from '@/utils/filter-params';
import { getAccessToken } from '@/app/actions/authActions';

interface SubcategoryPageProps {
    params: Promise<{ lang: string; category: string; subcategory: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SubcategoryPage({ params, searchParams }: SubcategoryPageProps) {
    const { lang, category: categorySlug, subcategory: subcategorySlug } = await params;
    const resolvedSearchParams = await searchParams;
    const dict = await getDictionary(lang as Locale);

    const token = await getAccessToken();

    const catalogTree = await getCatalogTreeApi(lang, 768, token ?? undefined);

    // Find level-1 parent by slug in the current locale tree
    let parentCat = catalogTree.find(c => c.slug === categorySlug);

    // Якщо не знайдено, можливо категорія існує, але прихована (відфільтрована бекендом) для обраного міста.
    if (!parentCat) {
        const globalTree = await getCatalogTreeApi(lang, 768, undefined);
        const parentGlob = globalTree.find(c => c.slug === categorySlug);
        if (parentGlob) {
            // Категорія існує глобально, але недоступна в цьому місті. Редиректимо на каталог.
            const langPrefix = lang === 'ua' ? '' : `/${lang}`;
            redirect(`${langPrefix}/catalog`);
        }
    }

    // Cross-locale fallback for parent slug (bidirectional: UA↔RU)
    if (!parentCat) {
        const otherLocales = ['ua', 'ru'].filter(l => l !== lang);
        for (const otherLang of otherLocales) {
            // Використовуємо глобальне дерево для крос-локалізаційного пошуку
            const otherGlobalTree = await getCatalogTreeApi(otherLang, 768, undefined);
            const otherParent = otherGlobalTree.find(c => c.slug === categorySlug);
            if (otherParent) {
                // Also translate the subcategory slug
                const otherSub = (otherParent.children ?? []).find(c => c.slug === subcategorySlug);
                const globalTree = await getCatalogTreeApi(lang, 768, undefined);
                const localizedParent = globalTree.find(c => c.id === otherParent.id);
                const localizedSub = otherSub && localizedParent
                    ? (localizedParent.children ?? []).find(c => c.id === otherSub.id)
                    : null;
                const langPrefix = lang === 'ua' ? '' : `/${lang}`;
                redirect(`${langPrefix}/${localizedParent?.slug ?? categorySlug}/${localizedSub?.slug ?? subcategorySlug}`);
            }
        }
        notFound();
    }

    // Find level-2 child by slug
    let matchedCat = (parentCat.children ?? []).find(c => c.slug === subcategorySlug);

    // Якщо не знайдено підкатегорію, перевіряємо, чи існує вона глобально
    if (!matchedCat) {
        const globalTree = await getCatalogTreeApi(lang, 768, undefined);
        const parentGlob = globalTree.find(c => c.id === parentCat.id);
        const subGlob = parentGlob ? (parentGlob.children ?? []).find(c => c.slug === subcategorySlug) : null;
        if (subGlob) {
            // Підкатегорія прихована для міста. Редиректимо на батьківську категорію.
            const langPrefix = lang === 'ua' ? '' : `/${lang}`;
            redirect(`${langPrefix}/${parentCat.slug}`);
        }
    }

    // Cross-locale fallback for subcategory slug (bidirectional: UA↔RU)
    if (!matchedCat) {
        const otherLocales = ['ua', 'ru'].filter(l => l !== lang);
        for (const otherLang of otherLocales) {
            const otherGlobalTree = await getCatalogTreeApi(otherLang, 768, undefined);
            const otherParent = otherGlobalTree.find(c => c.id === parentCat.id);
            const otherSub = (otherParent?.children ?? []).find(c => c.slug === subcategorySlug);
            if (otherSub) {
                const globalTree = await getCatalogTreeApi(lang, 768, undefined);
                const parentGlob = globalTree.find(c => c.id === parentCat.id);
                const localizedSub = parentGlob ? (parentGlob.children ?? []).find(c => c.id === otherSub.id) : null;
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
            token ?? undefined,
        ),
        getPopularProductsApi(undefined, 12, lang, token ?? undefined),
        getCategoryByIdApi(categoryId, lang, token ?? undefined),
    ]);
    productsResponse.current_page = page;

    // Якщо 0 товарів для обраного міста (і немає активних фільтрів) — редирект на батьківську категорію
    // Звідти якщо також немає товарів — спрацює редирект на /catalog
    const hasActiveFilters = activeFilters.length > 0 || !!sort;
    if (shouldRedirectForLocality(productsResponse.data.length, page, hasActiveFilters)) {
        const langPrefix = lang === 'ua' ? '' : `/${lang}`;
        redirect(`${langPrefix}/${parentCat.slug}`);
    }

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
