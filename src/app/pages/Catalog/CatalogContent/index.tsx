'use client';

import { useState } from 'react';
import s from './CatalogContent.module.scss';
import HeroBanner from '../../../components/ui/HeroBanner/HeroBanner';
import Breadcrumbs from '../../../components/ui/Breadcrumbs/Breadcrumbs';
import CategoryCircles from '@/app/components/CategoryCircles/CategoryCircles';
import Image from 'next/image';
import ProductCardRow from '@/app/components/ui/ProductCardRow';
import CatalogSidebar from '@/app/pages/Catalog/CatalogSidebar';
import FilterModal from '@/app/pages/Catalog/CatalogModal';
import ProductCard from '../../../components/ui/ProductCard/ProductCard';
import SectionHeader from '../../../components/ui/SectionHeader/SectionHeader';
import Pagination from '@/app/components/ui/Pagination/Pagination';
import ViewToggle, { ViewType } from '@/app/components/ui/ViewToggle/ViewToggle';
import SortSelect from '@/app/components/ui/SortSelect/SortSelect';
import FaqAccordion from '@/app/components/ui/FaqAccordion/FaqAccordion';
import clsx from 'clsx';
import CategorySwitcher from "@/app/components/ui/CategorySwitcher/CategorySwitcher";
import Button from "@/app/components/ui/Button/Button";

interface Product {
    id: number;
    title: string;
    weight: string;
    price: number;
    oldPrice?: number;
    unit: string;
    badge: string | null;
    image: string;
    description?: string;
}

const MOCK_RESULTS: Product[] = [
    { id: 1, title: "М'ясні палички з сиром", price: 2500, weight: '330г / 340г / 200г', unit: 'упаковка', badge: 'АКЦІЯ', image: '/images/products/product-shashlik.png', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet.' },
    { id: 2, title: "М'ясні палички в соусі Теріякі", price: 2500, oldPrice: 2840, weight: '330г / 340г / 200г', unit: 'упаковка', badge: 'NEW', image: '/images/products/product-meatballs.png', description: 'Proin gravida dolor sit amet lacus accumsan et viverra justo commodo.' },
    { id: 3, title: 'Тартар з відбірної яловичини', price: 2500, weight: '330г', unit: 'упаковка', badge: null, image: '/images/products/product-sticks-cheese.png', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet.' },
    { id: 4, title: 'Карпачо з відбірної яловичини', price: 2500, weight: '330г', unit: 'упаковка', badge: null, image: '/images/product-ribeye.jpg', description: 'Proin gravida dolor sit amet lacus accumsan et viverra justo commodo.' },
    { id: 5, title: 'Мітболи в соусі BBQ', price: 2500, weight: '200г', unit: 'упаковка', badge: null, image: '/images/product-shashlik.jpg', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
    { id: 6, title: 'Шашлик з баранини в пряному маринаді', price: 2500, weight: '330г', unit: 'упаковка', badge: null, image: '/images/product-sticks-cheese.jpg', description: 'Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan.' },
    { id: 7, title: 'Томлена курка в соусі азійському', price: 2500, weight: '330г', unit: 'упаковка', badge: null, image: '/images/products/product-meatballs.png', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
    { id: 8, title: 'Томлена курка в соусі карі', price: 2500, weight: '330г', unit: 'упаковка', badge: null, image: '/images/products/product-shashlik.png', description: 'Proin gravida dolor sit amet lacus accumsan et viverra justo commodo.' },
];

const MOCK_RELATED: Product[] = MOCK_RESULTS.slice(0, 4);
const MOCK_ORDERED: Product[] = MOCK_RESULTS.slice(0, 4);

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

const TOTAL_PAGES = 6;

interface CatalogContentProps {
    category?: string;
}

export default function CatalogContent({ category }: CatalogContentProps) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [activePage, setActivePage] = useState(1);
    const [sortBy, setSortBy] = useState(SORT_OPTIONS[0]);
    const [view, setView] = useState<ViewType>('list');

    const categoryLabel = category ? category : null;

    const breadcrumbItems = [
        { label: 'Головна', href: '/' },
        ...(categoryLabel ? [{ label: 'Каталог', href: '/catalog' }] : [{ label: 'Каталог' }]),
        ...(categoryLabel ? [{ label: categoryLabel }] : []),
    ];

    const pageTitle = categoryLabel ? categoryLabel.toUpperCase() : 'ГОТОВА ПРОДУКЦІЯ';

    return (
        <>
            <div className={s.container}>
                <div className={clsx(s.topSection, category && s.topSectionCategory)}>
                    <HeroBanner
                        prefix=""
                        title={pageTitle}
                        className={clsx(s.heroBanner, category && s.heroBannerCategory)}
                    />
                    {
                        category ? (
                            <Breadcrumbs items={breadcrumbItems} className={clsx(s.breadcrumbs, s.breadcrumbsCategory)} />
                        ) : (
                            <div className={s.categoriesSection}>
                                <CategoryCircles
                                    headerLeft={<Breadcrumbs items={breadcrumbItems} className={s.breadcrumbs} />}
                                />
                            </div>
                        )
                    }
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
                        {/* Toolbar - Full width on top */}
                        <div className={s.toolbar}>
                            {/* Sort dropdown */}
                            <SortSelect
                                label="Сортувати:"
                                value={sortBy}
                                options={SORT_OPTIONS}
                                onChange={setSortBy}
                                className={s.sortWrap}
                            />

                            {/* Mobile catalog button */}
                            <button
                                id="filter-btn"
                                type="button"
                                className={s.filterBtn}
                                onClick={() => setIsFilterOpen(true)}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_2764_1074)">
                                        <path d="M21 18V21H19V18H17V16H23V18H21ZM5 18V21H3V18H1V16H7V18H5ZM11 6V3H13V6H15V8H9V6H11ZM11 10H13V21H11V10ZM3 14V3H5V14H3ZM19 14V3H21V14H19Z" fill="black"/>
                                    </g>
                                    <circle cx="19.957" cy="6" r="4" fill="#E20B1C"/>
                                    <defs>
                                        <clipPath id="clip0_2764_1074">
                                            <rect width="24" height="24" fill="white"/>
                                        </clipPath>
                                    </defs>
                                </svg>
                                <span className={s.filterBtnText}>Фільтр</span>
                            </button>

                            {/* View toggles */}
                            <ViewToggle view={view} onViewChange={setView} className={s.viewToggle} />
                        </div>

                        <div className={s.contentLayout}>
                            <aside className={s.sidebar}>
                                { category && <CategorySwitcher />}
                                <CatalogSidebar 
                                    sortBy={sortBy} 
                                    onSortChange={setSortBy} 
                                />
                            </aside>

                            {/* Results column */}
                            <div className={s.results}>
                                {/* Product list */}
                                <div className={clsx(s.productList, view === 'grid' && s.productListGrid)}>
                                    {MOCK_RESULTS.length > 0 ? (
                                        MOCK_RESULTS.map(product => (
                                            view === 'grid' ? (
                                                <ProductCard
                                                    key={product.id}
                                                    id={product.id}
                                                    title={product.title}
                                                    weight={product.weight}
                                                    price={product.price}
                                                    unit={product.unit}
                                                    badge={product.badge}
                                                    image={product.image}
                                                />
                                            ) : (
                                                <ProductCardRow
                                                    key={product.id}
                                                    id={product.id}
                                                    title={product.title}
                                                    weight={product.weight}
                                                    price={product.price}
                                                    oldPrice={product.oldPrice}
                                                    unit={product.unit}
                                                    badge={product.badge}
                                                    image={product.image}
                                                    description={product.description}
                                                />
                                            )
                                        ))
                                    ) : (
                                        <div className={s.noResults}>Товарів не знайдено</div>
                                    )}
                                </div>

                                {/* Show more button */}
                                <div className={s.showMoreWrap}>
                                    <Button variant="outline-black" className={s.showMoreBtn}>
                                        <span className={s.showMoreBtnText}>показать еще</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="16" viewBox="0 0 13 16" fill="none">
                                            <path d="M11.8624 8.56895L6.43164 13.9997L1.00087 8.56895" stroke="black" strokeWidth="2" strokeLinecap="round"/>
                                            <line x1="6.42383" y1="12.7305" x2="6.42383" y2="0.999994" stroke="black" strokeWidth="2" strokeLinecap="round"/>
                                        </svg>
                                    </Button>
                                </div>

                                {/* Pagination */}
                                <Pagination
                                    currentPage={activePage}
                                    totalPages={TOTAL_PAGES}
                                    onPageChange={setActivePage}
                                    className={s.pagination}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* "Вас може зацікавити" */}
                <div className={s.relatedSection}>
                    <div className={s.relatedInner}>
                        <SectionHeader title="ВАС МОЖЕ ЗАЦІКАВИТИ" classNameWrapper={s.sectionTitle} />
                        <div className={s.relatedGrid}>
                            {MOCK_RELATED.map(product => (
                                <ProductCard
                                    key={`related-${product.id}`}
                                    id={product.id}
                                    title={product.title}
                                    weight={product.weight}
                                    price={product.price}
                                    unit={product.unit}
                                    badge={product.badge}
                                    image={product.image}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* "Часто замовляють" */}
                <div className={s.orderedSection}>
                    <div className={s.relatedInner}>
                        <SectionHeader title="ЧАСТО ЗАМОВЛЯЮТЬ" classNameWrapper={s.sectionTitle} />
                        <div className={s.relatedGrid}>
                            {MOCK_ORDERED.map(product => (
                                <ProductCard
                                    key={`ordered-${product.id}`}
                                    id={product.id}
                                    title={product.title}
                                    weight={product.weight}
                                    price={product.price}
                                    unit={product.unit}
                                    badge={product.badge}
                                    image={product.image}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* FAQ */}
                <div className={s.faqSection}>
                    <div className={s.relatedInner}>
                        <FaqAccordion items={FAQ_DATA} />
                    </div>
                </div>
            </div>

            {/* Mobile catalog drawer */}
            <FilterModal 
                isOpen={isFilterOpen} 
                onClose={() => setIsFilterOpen(false)} 
                sortBy={sortBy}
                onSortChange={setSortBy}
                category={category}
            />
        </>
    );
}
