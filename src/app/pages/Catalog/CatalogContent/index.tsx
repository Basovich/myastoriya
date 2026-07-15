import s from './CatalogContent.module.scss';
import HeroBanner from '../../../components/ui/HeroBanner/HeroBanner';
import Breadcrumbs from '../../../components/ui/Breadcrumbs/Breadcrumbs';
import CategoryCircles, { type CategoryCircleItem } from '@/app/components/CategoryCircles/CategoryCircles';
import Image from 'next/image';

import CatalogSidebar from '@/app/pages/Catalog/CatalogSidebar';
import ProductCard from '../../../components/ui/ProductCard/ProductCard';
import FaqAccordion from '@/app/components/ui/FaqAccordion/FaqAccordion';
import clsx from 'clsx';
import { Locale } from '@/i18n/config';
import { Dictionary } from '@/i18n/types';
import type { Product, ProductsResponse, FaqQuestion } from '@/lib/graphql';
import { resolveProductImageUrl, getProductWeight, getProductBadge } from '@/lib/graphql';
import type { FilterBlock, FilterStateInput } from '@/lib/graphql';
import type { BreadcrumbItem } from '@/utils/category-url';

// Client Islands
import CatalogToolbarClient from '../CatalogToolbarClient';
import CatalogProductsClient from '../CatalogProductsClient';
import CatalogRelatedSlidersClient from '../CatalogRelatedSlidersClient';

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
    /** Товари для блоку «Вас може зацікавити» (якщо додані через адмінку). */
    recommendedProducts?: Product[];
    /** URL банера категорії з API. */
    bannerUrl?: string | null;
    /** Мобільна версія банера (≤ 767px). */
    mobileImage?: string | null;
    /** FAQ дані з API. */
    faq?: FaqQuestion[] | null;
    isSubcategory?: boolean;
}

export default async function CatalogContent({
    lang,
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
    recommendedProducts,
    bannerUrl,
    mobileImage,
    faq,
    isSubcategory,
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
    const breadcrumbItems = breadcrumbItemsProp ?? [
        { label: 'Головна', href: '/' },
        ...(categoryName ? [{ label: categoryName }] : []),
    ];

    const pageTitle = categoryName ? categoryName.toUpperCase() : '';

    // Prepare related slider data
    const relatedProducts = recommendedProducts && recommendedProducts.length > 0
        ? recommendedProducts.map(product => ({
            id: product.id,
            element: (
                <ProductCard
                    id={product.id}
                    slug={product.slug}
                    title={product.name}
                    weight={getProductWeight(product)}
                    price={product.cost}
                    unit={product.unit}
                    badge={getProductBadge(product, lang)}
                    image={resolveProductImageUrl(product)}
                    lang={lang}
                    hasCostVariants={product.hasCostVariants}
                    portionSize={product.portionSize}
                />
            )
        }))
        : [];

    const popularProductsList = popularProducts ?? products.slice(0, 12);
    const orderedProducts = popularProductsList.map(product => ({
        id: product.id,
        element: (
            <ProductCard
                id={product.id}
                slug={product.slug}
                title={product.name}
                weight={getProductWeight(product)}
                price={product.cost}
                unit={product.unit}
                badge={getProductBadge(product, lang)}
                image={resolveProductImageUrl(product)}
                lang={lang}
                hasCostVariants={product.hasCostVariants}
                portionSize={product.portionSize}
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
                    className={clsx(
                        s.heroBanner,
                        categoryName && s.heroBannerCategory,
                        !bannerUrl && s.noBannerCategory
                    )}
                    image={bannerUrl || null}
                    mobileImage={mobileImage}
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
                                    isSubcategory={isSubcategory}
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

            {relatedProducts.length > 0 && (
                <CatalogRelatedSlidersClient title="ВАС МОЖЕ ЗАЦІКАВИТИ" products={relatedProducts} />
            )}
            <CatalogRelatedSlidersClient title="ЧАСТО ЗАМОВЛЯЮТЬ" products={orderedProducts} />

            {faq && faq.length > 0 && (
                <div className={s.faqSection}>
                    <div className={s.relatedInner}>
                        <FaqAccordion items={faq} />
                    </div>
                </div>
            )}
        </div>
    );
}
