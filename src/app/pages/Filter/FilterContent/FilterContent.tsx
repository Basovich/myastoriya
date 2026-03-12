'use client';

import { useState } from 'react';
import s from './FilterContent.module.scss';
import HeroBanner from '../../../components/ui/HeroBanner/HeroBanner';
import Breadcrumbs from '../../../components/ui/Breadcrumbs/Breadcrumbs';
import Image from 'next/image';
import FilterProductRow from '@/app/pages/Filter/FilterProductRow/FilterProductRow';
import FilterSidebar from '@/app/pages/Filter/FilterSidebar/FilterSidebar';
import FilterModal from '@/app/pages/Filter/FilterModal/FilterModal';
import ProductCard from '../../../components/ui/ProductCard/ProductCard';
import SectionHeader from '../../../components/ui/SectionHeader/SectionHeader';

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

const CATEGORY_PILLS = [
    { label: 'Гриль меню', active: false },
    { label: 'Бургери', active: true },
    { label: 'Набори для компанії', active: false },
    { label: 'Шашлик', active: false },
    { label: 'Меню ресторана', active: false },
    { label: 'Фірмова продукція', active: false },
];

const SORT_OPTIONS = [
    'По популярності',
    'Спочатку дешевші',
    'Спочатку дорожчі',
    'Новинки',
];

const TOTAL_PAGES = 6;

interface FilterContentProps {
    category?: string;
}

export default function FilterContent({ category }: FilterContentProps) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [activePage, setActivePage] = useState(1);
    const [sortBy, setSortBy] = useState(SORT_OPTIONS[0]);

    const breadcrumbItems = [
        { label: 'Головна', href: '/' },
        { label: 'Готова продукція', href: '/catalog' },
        { label: category || 'Каталог' },
    ];

    return (
        <>
            <div className={s.container}>
                {/* Banner */}
                <div className={s.topSection}>
                    <HeroBanner
                        prefix="ГОТОВА ПРОДУКЦІЯ"
                        title=""
                        className={s.heroBanner}
                    />
                </div>

                {/* Breadcrumbs */}
                <div className={s.breadcrumbsSection}>
                    <div className={s.breadcrumbsInner}>
                        <Breadcrumbs items={breadcrumbItems} className={s.breadcrumbs} />
                    </div>
                </div>

                {/* Category pills */}
                <div className={s.categoriesSection}>
                    <div className={s.categoriesInner}>
                        <div className={s.pillsScroll}>
                            {CATEGORY_PILLS.map(cat => (
                                <button
                                    key={cat.label}
                                    type="button"
                                    className={`${s.pill} ${cat.active ? s.pillActive : ''}`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main content: sidebar + results */}
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
                        {/* Desktop sidebar */}
                        <aside className={s.sidebar}>
                            <FilterSidebar />
                        </aside>

                        {/* Results column */}
                        <div className={s.results}>
                            {/* Toolbar */}
                            <div className={s.toolbar}>
                                {/* Mobile filter button */}
                                <button
                                    id="filter-btn"
                                    type="button"
                                    className={s.filterBtn}
                                    onClick={() => setIsFilterOpen(true)}
                                >
                                    <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 1H15M4 7H12M7 13H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    Фільтр
                                    <span className={s.filterDot} />
                                </button>

                                {/* View toggles */}
                                <div className={s.viewToggle}>
                                    <button id="view-grid-btn" type="button" className={s.viewBtn} aria-label="Сітка">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                                            <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                                            <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                                            <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                                        </svg>
                                    </button>
                                    <button id="view-list-btn" type="button" className={`${s.viewBtn} ${s.viewBtnActive}`} aria-label="Список">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect x="1" y="1" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
                                            <path d="M8 3H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                            <rect x="1" y="6.5" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
                                            <path d="M8 8.5H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                            <rect x="1" y="12" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
                                            <path d="M8 14H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                        </svg>
                                    </button>
                                </div>

                                {/* Sort dropdown */}
                                <div className={s.sortWrap}>
                                    <span className={s.sortLabel}>Сортування:</span>
                                    <div className={s.sortSelectWrap}>
                                        <select
                                            id="sort-select"
                                            className={s.sortSelect}
                                            value={sortBy}
                                            onChange={e => setSortBy(e.target.value)}
                                            aria-label="Сортування"
                                        >
                                            {SORT_OPTIONS.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                        <svg className={s.sortArrow} width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Product list */}
                            <div className={s.productList}>
                                {MOCK_RESULTS.length > 0 ? (
                                    MOCK_RESULTS.map(product => (
                                        <FilterProductRow
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
                                    ))
                                ) : (
                                    <div className={s.noResults}>Товарів не знайдено</div>
                                )}
                            </div>

                            {/* Pagination */}
                            <div className={s.pagination}>
                                <button
                                    id="pagination-prev"
                                    type="button"
                                    className={s.pageNavBtn}
                                    onClick={() => setActivePage(p => Math.max(1, p - 1))}
                                    disabled={activePage === 1}
                                    aria-label="Попередня сторінка"
                                >
                                    <svg width="8" height="13" viewBox="0 0 8 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M7 1L1 6.5L7 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                                {Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        id={`pagination-page-${page}`}
                                        type="button"
                                        className={`${s.pageBtn} ${activePage === page ? s.pageBtnActive : ''}`}
                                        onClick={() => setActivePage(page)}
                                        aria-label={`Сторінка ${page}`}
                                        aria-current={activePage === page ? 'page' : undefined}
                                    >
                                        {String(page).padStart(2, '0')}
                                    </button>
                                ))}
                                <button
                                    id="pagination-next"
                                    type="button"
                                    className={s.pageNavBtn}
                                    onClick={() => setActivePage(p => Math.min(TOTAL_PAGES, p + 1))}
                                    disabled={activePage === TOTAL_PAGES}
                                    aria-label="Наступна сторінка"
                                >
                                    <svg width="8" height="13" viewBox="0 0 8 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 1L7 6.5L1 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                            </div>

                            {/* Show more button */}
                            <div className={s.showMoreWrap}>
                                <button id="show-more-btn" type="button" className={s.showMoreBtn}>
                                    показать еще
                                    <svg width="10" height="15" viewBox="0 0 10 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 1L9 7.5L1 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
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
            </div>

            {/* Mobile filter drawer */}
            <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
        </>
    );
}
