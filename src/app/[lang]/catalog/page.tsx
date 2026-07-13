import { getDictionary } from '@/i18n/get-dictionary';
import { Locale } from '@/i18n/config';
import CatalogContent from '@/app/pages/Catalog/CatalogContent';
import { getCatalogTreeApi, getProductsApi } from '@/lib/graphql';
import { getCategoryHref } from '@/utils/category-url';
import { resolveCategoryImageUrl } from '@/lib/graphql/queries/products';
import type { Metadata } from 'next';
import { getAccessToken } from '@/app/actions/authActions';

interface CatalogPageProps {
    params: Promise<{ lang: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: CatalogPageProps): Promise<Metadata> {
    const { lang } = await params;
    const dict = await getDictionary(lang as Locale);
    const title = dict.catalog?.pageTitle ?? 'Каталог';
    return {
        title,
        description: title,
    };
}

export default async function CatalogPage({ params, searchParams }: CatalogPageProps) {
    const { lang } = await params;
    const resolvedSearchParams = await searchParams;
    const dict = await getDictionary(lang as Locale);

    const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page as string) : 1;
    const view = (resolvedSearchParams.view as 'list' | 'grid') || 'grid';
    const sort = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : undefined;

    // Завантажуємо дерево категорій та товари паралельно
    const token = await getAccessToken();

    const [catalogTree, productsResponse] = await Promise.all([
        getCatalogTreeApi(lang, 768, token ?? undefined),
        getProductsApi({ limit: 12, page, sort }, lang, token ?? undefined),
    ]);
    productsResponse.current_page = page;

    const pageTitle = dict.catalog?.pageTitle ?? 'Каталог';

    // Категорії першого рівня для CategoryCircles
    const subcategoryItems = catalogTree.map(cat => ({
        name: cat.name,
        image: resolveCategoryImageUrl(cat) || '/icons/icon-category.svg',
        href: getCategoryHref(cat),
    }));

    const breadcrumbItems = [
        { label: lang === 'ru' ? 'Главная' : 'Головна', href: '/' },
        { label: pageTitle },
    ];

    return (
        <main>
            <CatalogContent
                lang={lang as Locale}
                dict={dict}
                initialProducts={productsResponse}
                categoryId={768}
                categoryName={pageTitle}
                breadcrumbItems={breadcrumbItems}
                subcategoryItems={subcategoryItems.length > 0 ? subcategoryItems : undefined}
                view={view}
                sortBy={sort}
                bannerUrl="/images/catalog/category-desktop.webp"
                mobileImage="/images/catalog/category-mobile.webp"
            />
        </main>
    );
}
