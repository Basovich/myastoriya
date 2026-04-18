import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import Header from "@/app/components/Header/Header";
import Footer from "@/app/components/Footer/Footer";
import CatalogContent from "@/app/pages/Catalog/CatalogContent";
import { getProductsApi, getPopularCategoriesApi, getCategoriesApi } from "@/lib/graphql";
import type { ProductsResponse, ProductCategory } from "@/lib/graphql";

export default async function CatalogPage({
    params,
    searchParams,
}: {
    params: Promise<{ lang: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { lang } = await params;
    const resolvedSearchParams = await searchParams;
    const dict = await getDictionary(lang as Locale);

    const [popularCategories, allCategories] = await Promise.all([
        getPopularCategoriesApi(lang),
        getCategoriesApi(lang),
    ]);

    const firstCategoryId = popularCategories.length > 0 ? parseInt(popularCategories[0].id) : null;
    
    // Parse search parameters
    const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page as string) : 1;
    const view = (resolvedSearchParams.view as 'list' | 'grid') || 'list';

    const productsResponse = await getProductsApi(
        { categoryId: firstCategoryId, limit: 12, page },
        lang,
    );

    return (
        <>
            <Header lang={lang as Locale} />
            <main>
                <CatalogContent
                    lang={lang as Locale}
                    dict={dict}
                    initialProducts={productsResponse}
                    popularCategories={popularCategories}
                    allCategories={allCategories}
                    view={view}
                    sortBy={resolvedSearchParams.sort as string || 'За популярністю'}
                />
            </main>
            <Footer lang={lang as Locale} />
        </>
    );
}
