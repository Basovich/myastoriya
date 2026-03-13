'use client';

import { useState } from 'react';
import s from './FilterContent.module.scss';
import HeroBanner from '../../../components/ui/HeroBanner/HeroBanner';
import Breadcrumbs from '../../../components/ui/Breadcrumbs/Breadcrumbs';
import CategoryCircles from '@/app/components/CategoryCircles/CategoryCircles';
import Image from 'next/image';
import FilterProductRow from '@/app/pages/Filter/FilterProductRow/FilterProductRow';
import FilterSidebar from '@/app/pages/Filter/FilterSidebar/FilterSidebar';
import FilterModal from '@/app/pages/Filter/FilterModal/FilterModal';
import ProductCard from '../../../components/ui/ProductCard/ProductCard';
import SectionHeader from '../../../components/ui/SectionHeader/SectionHeader';
import Pagination from '@/app/components/ui/Pagination/Pagination';
import ViewToggle, { ViewType } from '@/app/components/ui/ViewToggle/ViewToggle';
import SortSelect from '@/app/components/ui/SortSelect/SortSelect';
import ShowMoreButton from '@/app/components/ui/ShowMoreButton/ShowMoreButton';

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
    'За замовчуванням',
    'За популярністю',
    'від дешевих до дорогих',
    'від дорогих до дешевих',
];

const TOTAL_PAGES = 6;

interface FilterContentProps {
    category?: string;
}

export default function FilterContent({ category }: FilterContentProps) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [activePage, setActivePage] = useState(1);
    const [sortBy, setSortBy] = useState(SORT_OPTIONS[0]);
    const [view, setView] = useState<ViewType>('list');

    const breadcrumbItems = [
        { label: 'Головна', href: '/' },
        { label: 'Готова продукція' },
    ];

    return (
        <>
            <div className={s.container}>
                <div className={s.topSection}>
                    <HeroBanner
                        prefix=""
                        title="ГОТОВА ПРОДУКЦІЯ"
                        className={s.heroBanner}
                    />
                    <div className={s.categoriesSection}>
                        <CategoryCircles
                            headerLeft={<Breadcrumbs items={breadcrumbItems} className={s.breadcrumbs} />}
                        />
                    </div>
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
                            <ViewToggle view={view} onViewChange={setView} className={s.viewToggle} />
                        </div>

                        <div className={s.contentLayout}>
                            <aside className={s.sidebar}>
                                <FilterSidebar />
                            </aside>

                            {/* Results column */}
                            <div className={s.results}>
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
                                <Pagination
                                    currentPage={activePage}
                                    totalPages={TOTAL_PAGES}
                                    onPageChange={setActivePage}
                                    className={s.pagination}
                                />

                                {/* Show more button */}
                                <div className={s.showMoreWrap}>
                                    <ShowMoreButton />
                                </div>
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
