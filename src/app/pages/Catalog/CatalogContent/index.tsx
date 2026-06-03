import s from './CatalogContent.module.scss';
import HeroBanner from '../../../components/ui/HeroBanner/HeroBanner';
import Breadcrumbs from '../../../components/ui/Breadcrumbs/Breadcrumbs';
import CategoryCircles, { type CategoryCircleItem } from '@/app/components/CategoryCircles/CategoryCircles';
import Image from 'next/image';
import ProductCardRow from '@/app/components/ui/ProductCardRow';
import CatalogSidebar from '@/app/pages/Catalog/CatalogSidebar';
import ProductCard from '../../../components/ui/ProductCard/ProductCard';
import FaqAccordion from '@/app/components/ui/FaqAccordion/FaqAccordion';
import clsx from 'clsx';
import { Locale } from '@/i18n/config';
import { Dictionary } from '@/i18n/types';
import type { Product, ProductsResponse } from '@/lib/graphql';
import { resolveProductImageUrl } from '@/lib/graphql';
import type { FilterBlock, FilterStateInput } from '@/lib/graphql';
import type { BreadcrumbItem } from '@/utils/category-url';


// Client Islands
import CatalogToolbarClient from '../CatalogToolbarClient';
import CatalogProductsClient from '../CatalogProductsClient';
import CatalogRelatedSlidersClient from '../CatalogRelatedSlidersClient';


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
    categoryId?: number;
    categoryName?: string;
    /** Pre-built breadcrumb items. Built by the page server component. */
    breadcrumbItems?: BreadcrumbItem[];
    /** Subcategories of the current category for CategoryCircles. Omit to hide the block. */
    subcategoryItems?: CategoryCircleItem[];
    view?: 'list' | 'grid';
    sortBy?: string;
    hideSidebar?: boolean;
    /** 12 найпопулярніших товарів на сайті (без прив'язки до категорії). */
    popularProducts?: Product[];
    /** Динамічні блоки фільтрів з API productsFilter. */
    filterBlocks?: FilterBlock[];
    /** Активні фільтри, десеріалізовані з URL. */
    activeFilters?: FilterStateInput[];
}

export default async function CatalogContent({
    lang,
    dict,
    initialProducts,
    categoryId,
    categoryName,
    breadcrumbItems: breadcrumbItemsProp,
    subcategoryItems,
    view = 'list',
    sortBy,
    hideSidebar = false,
    popularProducts,
    filterBlocks,
    activeFilters,
}: CatalogContentProps) {
    const sortLabel = lang === 'ua' ? 'Сортувати:' : 'Сортировать:';
    const filterLabel = lang === 'ua' ? 'Фільтр' : 'Фильтр';
    const clearLabel = lang === 'ua' ? 'Очистити' : 'Очистить';

    const sortOptions = lang === 'ua'
        ? [
            'За популярністю',
            'За зниженням ціни',
            'За зростанням ціни',
            'За рейтингом',
            'За обговорюваністю',
            'За датою',
          ]
        : [
            'По популярности',
            'По снижению цены',
            'По возрастанию цены',
            'По рейтингу',
            'По обсуждаемости',
            'По дате',
          ];

    const currentSort = sortBy || sortOptions[0];

    const products = initialProducts.data;
    const activePage = initialProducts.current_page;
    const hasMorePages = initialProducts.has_more_pages;

    const breadcrumbItems = breadcrumbItemsProp ?? [
        { label: 'Головна', href: '/' },
        ...(categoryName ? [{ label: categoryName }] : []),
    ];

    const pageTitle = categoryName ? categoryName.toUpperCase() : '';

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
                image={resolveProductImageUrl(product)}
                lang={lang}
            />
        )
    }));

    const popularProductsList = popularProducts ?? products.slice(0, 12);
    const orderedProducts = popularProductsList.map(product => ({
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
                image={resolveProductImageUrl(product)}
                lang={lang}
            />
        )
    }));

    return (
        <div className={s.container}>
            <div className={clsx(
                s.topSection,
                categoryName && s.topSectionCategory,
                (!subcategoryItems || subcategoryItems.length === 0) && s.topSectionNoSubcategories
            )}>
                <HeroBanner
                    prefix=""
                    title={pageTitle}
                    className={clsx(s.heroBanner, categoryName && s.heroBannerCategory)}
                />
                <Breadcrumbs items={breadcrumbItems} className={clsx(s.breadcrumbs, categoryName && s.breadcrumbsCategory)} />
                {subcategoryItems && subcategoryItems.length > 0 && (
                    <div className={s.categoriesSection}>
                        <CategoryCircles categories={subcategoryItems} />
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
                        sortBy={currentSort} 
                        view={view} 
                        sortOptions={sortOptions}
                        categoryId={categoryId}
                        hideFilter={hideSidebar}
                        sortLabel={sortLabel}
                        filterLabel={filterLabel}
                        clearLabel={clearLabel}
                        filterBlocks={filterBlocks}
                        activeFilters={activeFilters}
                    />

                    <div className={s.contentLayout}>
                        {!hideSidebar && (
                            <aside className={s.sidebar}>
                                <CatalogSidebar
                                    sortBy={currentSort}
                                    sortOptions={sortOptions}
                                    categoryId={categoryId}
                                    filterBlocks={filterBlocks}
                                    activeFilters={activeFilters}
                                />
                            </aside>
                        )}

                        <CatalogProductsClient
                            initialProducts={initialProducts}
                            categoryId={categoryId}
                            view={view}
                            lang={lang}
                            sort={currentSort}
                            activeFilters={activeFilters}
                        />
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
