import s from './CatalogContent.module.scss';
import HeroBanner from '../../../components/ui/HeroBanner/HeroBanner';
import Breadcrumbs from '../../../components/ui/Breadcrumbs/Breadcrumbs';
import CategoryCircles from '@/app/components/CategoryCircles/CategoryCircles';
import Image from 'next/image';
import ProductCardRow from '@/app/components/ui/ProductCardRow';
import CatalogSidebar from '@/app/pages/Catalog/CatalogSidebar';
import ProductCard from '../../../components/ui/ProductCard/ProductCard';
import FaqAccordion from '@/app/components/ui/FaqAccordion/FaqAccordion';
import clsx from 'clsx';
import CategorySwitcher from "@/app/components/ui/CategorySwitcher/CategorySwitcher";
import { Locale } from '@/i18n/config';
import { Dictionary } from '@/i18n/types';
import type { Product, ProductsResponse, PopularCategory, ProductCategory } from '@/lib/graphql';

// Client Islands
import CatalogToolbarClient from '../CatalogToolbarClient';
import CatalogPaginationClient from '../CatalogPaginationClient';
import CatalogRelatedSlidersClient from '../CatalogRelatedSlidersClient';

const SORT_OPTIONS = [
    'За популярністю',
    'Від дешевих до дорогих',
    'Від дорогих до дешевих',
];

const FAQ_DATA = [
    {
        question: 'Доставка преміальних стейків Україною?',
        answer: 'Для того, щоб посмакувати стейки щойно з гриля від наших шефів, немає кращого місця ніж фірмові магазини-ресторани «М\'ясторія» у Києві. Проте ви можете замовити відбірні стейки та свіжу мармурову яловичину в будь-яку точку України та приготувати улюблені страви вдома. Адже ми доставляємо сиру продукцію в охолодженому вигляді всією країною!'
    },
    {
        question: 'Новинки у лінійці «Томлене м\'ясо» від «М\'ясторія»?',
        answer: 'В нашій новій лінійці представлені унікальні рецепти томленого м\'яса, які готуються за низьких температур протягом багатьох годин. Це дозволяє зберегти максимум смаку та користі.'
    },
    {
        question: 'Як правильно готувати мармурову яловичину?',
        answer: 'Рекомендуємо смажити м\'ясо на добре розігрітій сковороді або грилі, попередньо давши йому "відпочити" при кімнатній температурі.'
    }
];

function getImageUrl(product: Product): string {
    const url = product.image?.url.grid2x ||
        product.image?.url.main2x ||
        product.image?.url.grid1x ||
        product.image?.url.main1x ||
        product.image?.url.big;

    if (!url) return '';
    if (url.startsWith('/')) return `https://dev-api.myastoriya.com.ua${url}`;
    return url;
}

function getBadge(product: Product): string | null {
    if (product.is_new) return 'NEW';
    if (product.oldCost && product.oldCost > product.cost) return 'АКЦІЯ';
    return null;
}

function getWeight(product: Product): string {
    const weightSpec = product.specifications?.find(sp =>
        sp.name.toLowerCase().includes('вага') ||
        sp.name.toLowerCase().includes("об'єм")
    );
    if (weightSpec && weightSpec.values.length > 0) return weightSpec.values[0];
    return product.multiplier ? `${product.multiplier}` : '';
}

interface CatalogContentProps {
    lang: Locale;
    dict: Dictionary;
    initialProducts: ProductsResponse;
    popularCategories: PopularCategory[];
    allCategories: ProductCategory[];
    categorySlug?: string;
    categoryName?: string;
    view?: 'list' | 'grid';
    sortBy?: string;
}

export default async function CatalogContent({
    lang,
    initialProducts,
    popularCategories,
    allCategories,
    categorySlug,
    categoryName,
    view = 'list',
    sortBy = 'За популярністю',
}: CatalogContentProps) {
    const products = initialProducts.data;
    const activePage = initialProducts.current_page;
    const hasMorePages = initialProducts.has_more_pages;

    const breadcrumbItems = [
        { label: 'Головна', href: '/' },
        ...(categoryName
            ? [{ label: 'Каталог', href: '/catalog' }, { label: categoryName }]
            : [{ label: 'Каталог' }]),
    ];

    const pageTitle = categoryName ? categoryName.toUpperCase() : 'ГОТОВА ПРОДУКЦІЯ';

    // Prepare related slider data
    const relatedProducts = products.slice(0, 8).map(product => ({
        id: product.id,
        element: (
            <ProductCard
                id={product.id}
                slug={product.slug}
                title={product.name}
                weight={getWeight(product)}
                price={product.cost}
                unit={product.unit}
                badge={getBadge(product)}
                image={getImageUrl(product)}
                lang={lang}
            />
        )
    }));

    const orderedProducts = products.slice(0, 8).map(product => ({
        id: product.id,
        element: (
            <ProductCard
                id={product.id}
                slug={product.slug}
                title={product.name}
                weight={getWeight(product)}
                price={product.cost}
                unit={product.unit}
                badge={getBadge(product)}
                image={getImageUrl(product)}
                lang={lang}
            />
        )
    }));

    return (
        <div className={s.container}>
            <div className={clsx(s.topSection, categoryName && s.topSectionCategory)}>
                <HeroBanner
                    prefix=""
                    title={pageTitle}
                    className={clsx(s.heroBanner, categoryName && s.heroBannerCategory)}
                />
                {categoryName ? (
                    <Breadcrumbs items={breadcrumbItems} className={clsx(s.breadcrumbs, s.breadcrumbsCategory)} />
                ) : (
                    <div className={s.categoriesSection}>
                        <CategoryCircles
                            headerLeft={<Breadcrumbs items={breadcrumbItems} className={s.breadcrumbs} />}
                        />
                    </div>
                )}
            </div>

            <div className={s.mainSection}>
                <Image
                    src="/images/products/products-bg-logo.svg"
                    alt=""
                    width={786}
                    height={1011}
                    className={s.bgLogo}
                    aria-hidden="true"
                />

                <div className={s.mainInner}>
                    <CatalogToolbarClient 
                        sortBy={sortBy} 
                        view={view} 
                        sortOptions={SORT_OPTIONS}
                        categoryName={categoryName}
                    />

                    <div className={s.contentLayout}>
                        <aside className={s.sidebar}>
                            {categoryName && <CategorySwitcher />}
                            <CatalogSidebar
                                sortBy={sortBy}
                            />
                        </aside>

                        <div className={s.results}>
                            <div className={clsx(s.productList, view === 'grid' && s.productListGrid)}>
                                {products.length > 0 ? (
                                    products.map(product => (
                                        view === 'grid' ? (
                                            <ProductCard
                                                key={product.id}
                                                id={product.id}
                                                slug={product.slug}
                                                title={product.name}
                                                weight={getWeight(product)}
                                                price={product.cost}
                                                unit={product.unit}
                                                badge={getBadge(product)}
                                                image={getImageUrl(product)}
                                                lang={lang}
                                            />
                                        ) : (
                                            <ProductCardRow
                                                key={product.id}
                                                id={product.id}
                                                slug={product.slug}
                                                title={product.name}
                                                weight={getWeight(product)}
                                                price={product.cost}
                                                oldPrice={product.oldCost ?? undefined}
                                                unit={product.unit}
                                                badge={getBadge(product)}
                                                image={getImageUrl(product)}
                                                lang={lang}
                                            />
                                        )
                                    ))
                                ) : (
                                    <div className={s.noResults}>Товарів не знайдено</div>
                                )}
                            </div>

                            <CatalogPaginationClient 
                                currentPage={activePage} 
                                hasMorePages={hasMorePages} 
                            />
                        </div>
                    </div>
                </div>
            </div>

            <CatalogRelatedSlidersClient title="ВАС МОЖЕ ЗАЦІКАВИТИ" products={relatedProducts} />
            <CatalogRelatedSlidersClient title="ЧАСТО ЗАМОВЛЯЮТЬ" products={orderedProducts} />

            <div className={s.faqSection}>
                <div className={s.relatedInner}>
                    <FaqAccordion items={FAQ_DATA} />
                </div>
            </div>
        </div>
    );
}
