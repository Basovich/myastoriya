import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import Header from "@/app/components/Header/Header";
import Footer from "@/app/components/Footer/Footer";
import CatalogContent from "@/app/pages/Catalog/CatalogContent";
import { getProductsApi, getPopularCategoriesApi, getCategoriesApi } from "@/lib/graphql";

interface CategoryCatalogPageProps {
    params: Promise<{ lang: string; category: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CategoryCatalogPage({ params, searchParams }: CategoryCatalogPageProps) {
    const { lang, category } = await params;
    const resolvedSearchParams = await searchParams;
    const dict = await getDictionary(lang as Locale);

    const [popularCategories, allCategories] = await Promise.all([
        getPopularCategoriesApi(lang),
        getCategoriesApi(lang),
    ]);

    // Find category by slug to get its ID and display name
    const matchedCategory = allCategories.find(c => c.slug === category);
    const categoryId = matchedCategory ? parseInt(matchedCategory.id) : null;
    const categoryName = matchedCategory?.name ?? category;

    // Parse search parameters
    const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page as string) : 1;
    const view = (resolvedSearchParams.view as 'list' | 'grid') || 'list';

    const initialProductsResponse = await getProductsApi(
        { categoryId, limit: 12, page },
        lang,
    );

    return (
        <>
            <Header lang={lang as Locale} />
            <main>
                <CatalogContent
                    lang={lang as Locale}
                    dict={dict}
                    initialProducts={initialProductsResponse}
                    popularCategories={popularCategories}
                    allCategories={allCategories}
                    categorySlug={category}
                    categoryName={categoryName}
                    view={view}
                    sortBy={resolvedSearchParams.sort as string || 'За популярністю'}
                />
            </main>
            <Footer lang={lang as Locale} />
        </>
    );
}
