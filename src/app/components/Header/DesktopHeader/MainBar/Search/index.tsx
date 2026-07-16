"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import s from "./Search.module.scss";
import { useScrollLock } from "@/hooks/useScrollLock";
import Image from "next/image";
import Logo from "@/app/components/Header/Shared/Logo";
import WishButton from "@/app/components/ui/WishButton/WishButton";
import AddToCartButton from "@/app/components/ui/AddToCartButton/AddToCartButton";
import Badge from "@/app/components/ui/Badge/Badge";
import { Locale } from "@/i18n/config";
import { getLocalizedHref } from "@/utils/i18n-helpers";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { getSalesApi } from "@/lib/graphql";
import { 
    getProductsApi, 
    getSearchCategoriesApi, 
    getSearchPopularQueriesApi, 
    getCatalogTreeApi,
    resolveProductImageUrl, 
    Product, 
    ProductCategory,
    getProductBadge
} from "@/lib/graphql/queries/products";

function getProductWeightForSearch(product: Product): string {
    const nameMatch = product.name.match(/(\d+([.,]\d+)?)\s*(л|l|мл|ml|г|g|кг|kg)(?![а-яА-Яa-zA-Z0-9])/i);
    if (nameMatch) {
        return nameMatch[0];
    }

    let weightSpec = product.specifications?.find(sp => {
        const name = sp.name.toLowerCase();
        const hasWeightKeyword = name.includes('вага') || name.includes('важ') || name.includes('вес') || name.includes("об'єм");
        if (!hasWeightKeyword) return false;
        const val = sp.values[0] || '';
        return !(val === '1' && (name === 'вага' || name === 'вес'));
    });

    if (!weightSpec) {
        weightSpec = product.specifications?.find(sp => {
            const name = sp.name.toLowerCase();
            return name.includes('вага') || name.includes('важ') || name.includes('вес') || name.includes("об'єм");
        });
    }

    if (weightSpec && weightSpec.values.length > 0) {
        const val = weightSpec.values[0];
        const cleanVal = val.replace(/[0-9.,\s-]/g, '');
        if (cleanVal.length === 0) {
            const specName = weightSpec.name.toLowerCase();
            const titleLower = product.name.toLowerCase();
            const unitLower = product.unit?.toLowerCase() || '';
            const isLiquid = specName.includes("об'єм") || specName.includes('обьем') || 
                specName.includes('мл') || specName.includes('ml') || 
                unitLower.includes('мл') || unitLower.includes('ml') ||
                /вино|пиво|сік|сок|вод|кола|нектар|напій|напиток|лимонад|сидр|wine|beer|juice|beverage/i.test(titleLower);

            let formattedVal: string;
            const unitClean = unitLower.trim();
            const num = parseFloat(val.replace(',', '.'));
            const roundedWeight = isNaN(num) ? val : (num >= 10 ? String(Math.round(num)) : String(Math.round(num * 100) / 100));
            
            if (!isNaN(num) && num === 1) {
                if (unitClean === 'шт') {
                    formattedVal = '1 шт';
                } else if (unitClean === 'уп') {
                    formattedVal = '1 уп';
                } else if (unitClean === 'кг' || unitClean === 'kg') {
                    formattedVal = '1 кг';
                } else if (unitClean === 'г' || unitClean === 'g') {
                    formattedVal = '1 г';
                } else if (unitClean === 'мл' || unitClean === 'ml') {
                    formattedVal = '1 мл';
                } else if (unitClean === 'л' || unitClean === 'l') {
                    formattedVal = '1 л';
                } else {
                    formattedVal = '1 шт';
                }
            } else {
                if (unitClean === 'шт') {
                    formattedVal = `${roundedWeight} ${isLiquid ? 'мл' : 'г'}`;
                } else if (unitClean === 'уп') {
                    formattedVal = `${roundedWeight} уп`;
                } else if (specName.includes('кг') || specName.includes('kg') || unitClean === 'кг' || unitClean === 'kg') {
                    formattedVal = `${roundedWeight} кг`;
                } else if (specName.includes('л') || specName.includes('l') || unitClean === 'л' || unitClean === 'l') {
                    if (!specName.includes('мл') && !specName.includes('ml') && unitClean !== 'мл' && unitClean !== 'ml') {
                        formattedVal = `${roundedWeight} л`;
                    } else {
                        formattedVal = `${roundedWeight} мл`;
                    }
                } else if (unitClean === 'г' || unitClean === 'g') {
                    formattedVal = `${roundedWeight} г`;
                } else if (unitClean === 'мл' || unitClean === 'ml') {
                    formattedVal = `${roundedWeight} мл`;
                } else {
                    formattedVal = `${roundedWeight} ${isLiquid ? 'мл' : 'г'}`;
                }
            }
            return formattedVal;
        }
        return val;
    }

    if (product.multiplier && product.multiplier > 0) {
        const normalizedUnit = product.unit?.trim().toLowerCase() || '';
        if (normalizedUnit === '100 г' || normalizedUnit === '100г') {
            return `${Math.round(product.multiplier * 1000)} г`;
        } else if (normalizedUnit === '100 мл') {
            return `${Math.round(product.multiplier * 1000)} мл`;
        } else if (normalizedUnit === 'шт') {
            return `${product.multiplier} шт`;
        } else {
            return `${product.multiplier} ${product.unit}`;
        }
    }

    return product.unit ? (product.unit.toLowerCase() === 'шт' ? '1 шт' : product.unit) : '';
}

interface CategoryLinkProps {
    cat: ProductCategory;
    lang: string;
    router: ReturnType<typeof useRouter>;
    isRoot?: boolean;
}

const CategoryLink = ({ cat, lang, router, isRoot = false }: CategoryLinkProps) => {
    return (
        <li className={isRoot ? s.categoryItem : s.subItemWrapper}>
            <div 
                className={isRoot ? s.mainCat : s.subItem} 
                onClick={() => router.push(getLocalizedHref(`/catalog/${cat.slug}`, lang as Locale))}
            >
                {cat.name}
            </div>
            {cat.children && cat.children.length > 0 && (
                <ul className={s.subList}>
                    {cat.children.map(sub => (
                        <CategoryLink 
                            key={sub.id} 
                            cat={sub} 
                            lang={lang} 
                            router={router} 
                        />
                    ))}
                </ul>
            )}
        </li>
    );
};

export default function Search({ lang, categories }: { lang: Locale; categories?: ProductCategory[] }) {
    const [query, setQuery] = useState("");
    const [isActive, setIsActive] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false);
    const [results, setResults] = useState<Product[]>([]);
    const [featuredProposals, setFeaturedProposals] = useState<Product[]>([]);
    const [searchCategories, setSearchCategories] = useState<ProductCategory[]>([]);
    const [popularQueries, setPopularQueries] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const isLoadingProposalsRef = useRef(false);
    const [proposalsPage, setProposalsPage] = useState(1);
    const [hasMoreProposals, setHasMoreProposals] = useState(true);
    const [isProposalsLoading, setIsProposalsLoading] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const containerRef = useRef<HTMLDivElement>(null);
    const { disableScroll, enableScroll } = useScrollLock();
    const isLoadingMoreRef = useRef(false);

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!query.trim()) {
            return;
        }

        router.push(getLocalizedHref(`/search?q=${encodeURIComponent(query)}`, lang));
        setIsActive(false);
        setShowOverlay(false);
    };

    const handleInputFocus = () => {
        setIsActive(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        if (value.length >= 3) {
            setShowOverlay(true);
        } else {
            setShowOverlay(false);
            setResults([]);
            setSearchCategories([]);
            setPage(1);
            setHasMore(false);
            isLoadingMoreRef.current = false;
        }
    };

    const handleLoadMore = async () => {
        if (isLoadingMoreRef.current || !hasMore) return;
        isLoadingMoreRef.current = true;
        setIsLoadingMore(true);
        try {
            const nextPage = page + 1;
            const prodRes = await getProductsApi({ search: query, limit: 12, page: nextPage }, lang);
            setResults(prev => {
                const existingIds = new Set(prev.map(p => p.id));
                const newItems = prodRes.data.filter(p => !existingIds.has(p.id));
                return [...prev, ...newItems];
            });
            setHasMore(prodRes.has_more_pages);
            setPage(nextPage);
        } catch (error) {
            console.error("Load more search results error:", error);
        } finally {
            setIsLoadingMore(false);
            isLoadingMoreRef.current = false;
        }
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const reachedBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
        if (reachedBottom) {
            handleLoadMore();
        }
    };
    
    // Close overlay on pathname change
    useEffect(() => {
        setIsActive(false);
    }, [pathname]);

    const fetchProposals = useCallback(async (startPage: number, targetCount: number, currentList: Product[]) => {
        if (isLoadingProposalsRef.current) return;
        isLoadingProposalsRef.current = true;
        setIsProposalsLoading(true);

        let currentPage = startPage;
        let accumulated: Product[] = [...currentList];
        let hasMore = true;

        try {
            // First page initialization - try fetching from active sales first!
            if (currentPage === 1 && accumulated.length === 0) {
                try {
                    const salesRes = await getSalesApi(50, 1, lang);
                    if (salesRes && salesRes.data && salesRes.data.length > 0) {
                        const seen = new Set<string>();
                        const uniquePromo: Product[] = [];
                        
                        // Fetch in batches of 5 sales to prevent long execution and network overload
                        const batchSize = 5;
                        for (let i = 0; i < salesRes.data.length; i += batchSize) {
                            const batch = salesRes.data.slice(i, i + batchSize);
                            const productsPromises = batch.map(async (sale) => {
                                try {
                                    const res = await getProductsApi({ saleId: parseInt(sale.id), limit: 20, silent: true }, lang);
                                    return res.data || [];
                                } catch (err) {
                                    console.warn(`[Search] Failed to fetch products for sale ${sale.id}:`, err);
                                    return [];
                                }
                            });
                            
                            const productsLists = await Promise.all(productsPromises);
                            const allSaleProducts = productsLists.flat();
                            
                            // Filter: oldCost > cost and deduplicate
                            for (const item of allSaleProducts) {
                                if (item.oldCost && item.oldCost > item.cost && !seen.has(String(item.id))) {
                                    seen.add(String(item.id));
                                    uniquePromo.push(item);
                                }
                            }
                            
                            // If we have collected enough items, stop requesting products for remaining sales
                            if (uniquePromo.length >= targetCount) {
                                break;
                            }
                        }
                        
                        accumulated = uniquePromo;
                        
                        // If we loaded enough from sales, we can complete or mark hasMore accordingly
                        if (accumulated.length >= targetCount) {
                            hasMore = false;
                        }
                    }
                } catch (salesErr) {
                    console.warn("[Search] Failed to fetch sales for proposals:", salesErr);
                }
            }

            // Fallback: if we still need more or couldn't get any from sales, fetch page-by-page from general products
            while (accumulated.length < targetCount && hasMore) {
                const limit = 40;
                const res = await getProductsApi({ limit, page: currentPage }, lang);
                const promoItems = res.data.filter(p => p.oldCost && p.oldCost > p.cost);

                const existingIds = new Set(accumulated.map(p => p.id));
                const newItems = promoItems.filter(p => !existingIds.has(p.id));
                accumulated = [...accumulated, ...newItems];

                hasMore = res.has_more_pages;
                if (hasMore && accumulated.length < targetCount) {
                    currentPage++;
                } else {
                    break;
                }
            }
        } catch (err) {
            console.error("Error fetching proposals:", err);
        } finally {
            if (accumulated.length === 0) {
                accumulated = Array.from({ length: 10 }, (_, i) => ({
                    id: `mock-promo-${i}`,
                    name: lang === 'ru' ? `Акционный Товар ${i + 1}` : `Акційний Товар ${i + 1}`,
                    slug: `mock-promo-${i}`,
                    cost: 100 + i * 10,
                    oldCost: 150 + i * 10,
                    unit: 'кг',
                    multiplier: 1,
                    is_new: false,
                    available: true,
                    portionSize: '1 кг',
                    isWeighty: true,
                    hasCostVariants: false,
                    specifications: [
                        { name: 'вага', values: ['1 кг'] }
                    ],
                    image: {
                        url: {
                            big: '/images/product-placeholder.svg'
                        }
                    }
                } as unknown as Product));
            }
            setFeaturedProposals(accumulated);
            setProposalsPage(currentPage);
            setHasMoreProposals(hasMore);
            setIsProposalsLoading(false);
            isLoadingProposalsRef.current = false;
        }
    }, [lang]);

    // Initial data fetch when active
    useEffect(() => {
        if (isActive) {
            // Fetch popular queries
            getSearchPopularQueriesApi(undefined, 6, lang).then(setPopularQueries).catch(console.error);
            fetchProposals(1, 10, []);
        } else {
            setFeaturedProposals([]);
            setProposalsPage(1);
            setHasMoreProposals(true);
            setCurrentSlide(0);
        }
    }, [isActive, lang, fetchProposals]);

    // Lazy load more proposals as swiper index moves closer to the end
    useEffect(() => {
        if (isActive && featuredProposals.length > 0 && hasMoreProposals && !isLoadingProposalsRef.current) {
            if (currentSlide >= featuredProposals.length - 2) {
                fetchProposals(proposalsPage, 5, featuredProposals);
            }
        }
    }, [currentSlide, featuredProposals, hasMoreProposals, proposalsPage, fetchProposals, isActive]);

    // Debounced search fetch
    useEffect(() => {
        if (query.length < 3) return;

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const prodRes = await getProductsApi({ search: query, limit: 12, page: 1 }, lang);
                const uniqueData = prodRes.data.filter((p, index, self) => 
                    self.findIndex(item => item.id === p.id) === index
                );
                setResults(uniqueData);
                setHasMore(prodRes.has_more_pages);
                setPage(1);
                isLoadingMoreRef.current = false;

                // Extract category IDs from found products to include their categories in results
                const productCategoryIds = new Set(
                    prodRes.data
                        .map(p => p.categoryId ? String(p.categoryId) : "")
                        .filter(Boolean)
                );

                // Local tree filtering for categories to show hierarchy
                const queryWords = query.toLowerCase().split(/[\s'.,!?()«»"]+/).filter(w => w.length >= 3);
                const productWords = prodRes.data.map(p => p.name.toLowerCase()).join(" ").split(/[\s'.,!?()«»"]+/).filter(w => w.length >= 3);
                const contextWords = Array.from(new Set([...queryWords, ...productWords]));

                const isWordMatch = (w1: string, w2: string) => {
                    const minLen = Math.min(w1.length, w2.length);
                    if (minLen < 3) return false;
                    const matchLen = minLen >= 5 ? 4 : 3;
                    return w1.slice(0, matchLen) === w2.slice(0, matchLen);
                };

                const filterTree = (list: ProductCategory[], parentName?: string): ProductCategory[] => {
                    const matches: ProductCategory[] = [];
                    for (const cat of list) {
                        const productMatch = productCategoryIds.has(String(cat.id));
                        
                        let nameMatch = false;
                        if (parentName) {
                            const parentWords = parentName.toLowerCase().split(/[\s'.,!?()«»"]+/).filter(w => w.length >= 3);
                            const catWords = cat.name.toLowerCase().split(/[\s'.,!?()«»"]+/).filter(w => w.length >= 3);
                            const specificWords = catWords.filter(catW => 
                                !parentWords.some(parentW => isWordMatch(catW, parentW))
                            );
                            
                            if (specificWords.length > 0) {
                                nameMatch = specificWords.some(specW => 
                                    contextWords.some(ctxW => isWordMatch(specW, ctxW))
                                );
                            } else {
                                nameMatch = true;
                            }
                        } else {
                            const catWords = cat.name.toLowerCase().split(/[\s'.,!?()«»"]+/).filter(w => w.length >= 3);
                            nameMatch = catWords.some(catW => 
                                contextWords.some(ctxW => isWordMatch(catW, ctxW))
                            );
                        }
                        
                        const isMatched = productMatch || nameMatch;
                        const childMatches = cat.children ? filterTree(cat.children, cat.name) : [];
                        
                        if (isMatched || childMatches.length > 0) {
                            matches.push({
                                ...cat,
                                children: childMatches
                            });
                        }
                    }
                    return matches;
                };

                if (categories) {
                    setSearchCategories(filterTree(categories));
                } else {
                    let catRes = await getSearchCategoriesApi(query, lang);
                    if (catRes.length === 0 && productCategoryIds.size > 0) {
                        try {
                            const tree = await getCatalogTreeApi(lang);
                            catRes = filterTree(tree);
                        } catch (e) {
                            console.error("Failed to fetch/filter catalog tree by product categories:", e);
                        }
                    }
                    setSearchCategories(catRes);
                }

            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setIsLoading(false);
                setCurrentSlide(0);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [query, lang, categories]);



    // 1. Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const isInsideModal = target instanceof Element && !!target.closest('.ReactModalPortal');

            if (
                containerRef.current &&
                !containerRef.current.contains(target) &&
                !isInsideModal
            ) {
                setIsActive(false);
            }
        };

        if (isActive) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isActive]);

    // 2. Handle scroll lock based on isActive
    useEffect(() => {
        if (isActive) {
            disableScroll();
        } else {
            enableScroll();
        }

        // Cleanup function for when component unmounts while active
        return () => {
            if (isActive) {
                enableScroll();
            }
        };
    }, [isActive, disableScroll, enableScroll]);

    return (
        <div className={clsx(s.searchContainer, isActive && s.active)} ref={containerRef}>
            <div className={s.headerSearch} onClick={handleInputFocus}>
                <div className={s.iconWrapper}>
                    <Image src="/icons/icon-search.svg" alt="Search" width="20" height="20" />
                </div>
                <div className={s.placeholderText}>{lang === 'ru' ? 'Я ищу...' : 'Я шукаю...'}</div>
                <button className={s.headerSearchBtn}>{lang === 'ru' ? 'поиск' : 'пошук'}</button>
            </div>

            {isActive && (
                <div className={s.searchOverlay} onClick={() => setIsActive(false)}>
                    <div className={s.backdrop} />
                    <div className={s.searchBlock} onClick={(e) => e.stopPropagation()}>
                        <div className={s.topBar}>
                            <div className={s.topBarContainer}>
                                <div className={s.logoSide}>
                                    <Logo lang={lang} theme="black" />
                                </div>
                                <div className={s.separator} />
                                <div className={s.inputWrapper}>
                                    <input
                                        type="text"
                                        placeholder={lang === 'ru' ? 'Я ищу...' : 'Я шукаю...'}
                                        className={s.overlayInput}
                                        value={query}
                                        autoFocus
                                        onChange={handleInputChange}
                                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    />
                                    {isLoading && <div className={s.loaderSmall} />}
                                    <button className={s.clearBtn} onClick={() => setIsActive(false)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                            <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="black" />
                                        </svg>
                                    </button>
                                </div>
                                <div className={s.rightSeparator} />
                                <button className={s.searchBtnIcon} onClick={handleSearch} aria-label="Search">
                                    <Image src="/icons/icon-search-red.svg" alt="Search" width="22" height="22" />
                                </button>
                            </div>
                        </div>

                        {showOverlay && (
                            <div className={clsx(s.resultsWrapper, isLoading && s.loadingStyles)}>
                                {results.length === 0 && !isLoading ? (
                                    <div className={s.noResults}>
                                        {lang === 'ua' ? 'Товарів не знайдено' : 'Товаров не найдено'}
                                    </div>
                                ) : (
                                    <div className={s.contentBody}>
                                        <div className={s.colCategories}>
                                            <h3 className={s.colTitle}>{lang === 'ru' ? 'Категории' : 'Категорії'}</h3>
                                            <ul className={s.categoryList}>
                                                {searchCategories.length > 0 ? (
                                                    searchCategories.map(cat => (
                                                        <CategoryLink 
                                                            key={cat.id} 
                                                            cat={cat} 
                                                            lang={String(lang)} 
                                                            router={router} 
                                                            isRoot={true}
                                                        />
                                                    ))
                                                ) : query.length >= 3 && !isLoading ? (
                                                    <li className={s.noResultsInline}>{lang === 'ru' ? 'Ничего не найдено' : 'Нічого не знайдено'}</li>
                                                ) : (
                                                    popularQueries.map((q, idx) => (
                                                        <li key={idx} onClick={() => setQuery(q)}>
                                                            {q}
                                                        </li>
                                                    ))
                                                )}
                                            </ul>
                                        </div>

                                        <div className={s.colDishes}>
                                            <div className={s.colTitleWrapper}>
                                                <h3 className={s.colTitle}>{lang === 'ru' ? 'Блюда' : 'Страви'}</h3>
                                                <div className={s.titleIcon}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><g opacity="0.5"><path d="M8.12988 2.7124C11.1214 2.71258 13.5459 5.13784 13.5459 8.12939C13.5458 9.47077 13.0547 10.7039 12.2383 11.6538L12.4717 11.8794H13.1299L17.2881 16.0454L16.0459 17.2876L11.8799 13.1294V12.4712L11.6543 12.2378C10.7044 13.0542 9.47126 13.5453 8.12988 13.5454C5.13833 13.5454 2.71307 11.1209 2.71289 8.12939C2.71289 5.13773 5.13822 2.7124 8.12988 2.7124ZM8.12988 4.37939C6.05488 4.37939 4.37988 6.05439 4.37988 8.12939C4.38006 10.2042 6.05499 11.8794 8.12988 11.8794C10.2046 11.8792 11.8797 10.2041 11.8799 8.12939C11.8799 6.0545 10.2047 4.37957 8.12988 4.37939Z" fill="black" /></g></svg>
                                                </div>
                                            </div>
                                            <div className={s.dishListContainer}>
                                                <div className={s.dishList} onScroll={handleScroll}>
                                                    {isLoading ? (
                                                        <div className={s.spinnerWrapper}>
                                                            <div className={s.spinner} />
                                                        </div>
                                                    ) : results.length > 0 ? (
                                                        <>
                                                            {results.map((product) => {
                                                                const mainImage = resolveProductImageUrl(product);
                                                                const displayWeight = getProductWeightForSearch(product);
                                                                
                                                                return (
                                                                    <div key={product.id} className={s.dishItem} onClick={() => router.push(getLocalizedHref(`/products/${product.slug || product.id}`, lang as Locale))}>
                                                                        <div className={s.dishThumb}>
                                                                            <Image src={mainImage || "/images/product-placeholder.svg"} alt={product.name} fill />
                                                                        </div>
                                                                        <div className={s.dishInfo}>
                                                                            <div className={s.dishName}>{product.name}</div>
                                                                            <div className={s.dishWeight}>{displayWeight}</div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                            {isLoadingMore && <div className={s.loader}></div>}
                                                        </>
                                                    ) : (
                                                        <div className={s.emptyPrompt}>{lang === 'ru' ? 'Товаров не найдено' : 'Товарів не знайдено'}</div>
                                                    )}
                                                </div>
                                            </div>
                                            <button className={s.showAllResults} onClick={handleSearch}>
                                                {lang === 'ru' ? 'Показать все результаты' : 'Показати всі результати'}
                                            </button>
                                        </div>

                                        <div className={s.colSuggestions}>
                                            <h3 className={s.colTitle}>{lang === 'ru' ? 'Лучшие предложения по поиску' : 'Кращі пропозиції за пошуком'}</h3>
                                            <div className={s.suggestionsContainer}>
                                                {isProposalsLoading ? (
                                                    <div className={s.spinnerWrapper}>
                                                        <div className={s.spinner} />
                                                    </div>
                                                ) : featuredProposals.length > 0 ? (
                                                    <>
                                                        {featuredProposals.length > 1 ? (
                                                            <div className={s.sliderWrapper}>
                                                                <Swiper
                                                                    key={featuredProposals.length}
                                                                    modules={[Pagination]}
                                                                    pagination={{
                                                                        clickable: true,
                                                                        dynamicBullets: true,
                                                                        dynamicMainBullets: 1
                                                                    }}
                                                                    spaceBetween={0}
                                                                    slidesPerView={1}
                                                                    onSlideChange={(swiper) => {
                                                                        setCurrentSlide(swiper.activeIndex);
                                                                    }}
                                                                    className={s.swiperContainer}
                                                                >
                                                                    {featuredProposals.map((product) => {
                                                                        const mainImage = resolveProductImageUrl(product);
                                                                        const displayWeight = getProductWeightForSearch(product);
                                                                        const displayUnit = product.unit.toLowerCase() === "шт"
                                                                            ? "За 1 шт"
                                                                            : `За ${product.unit}`;
                                                                        const badgeText = getProductBadge(product, String(lang));
                                                                        const hasPromo = badgeText && (badgeText === 'АКЦІЯ' || badgeText === 'АКЦИЯ');

                                                                        return (
                                                                            <SwiperSlide key={product.id}>
                                                                                <div className={s.featuredCard}>
                                                                                    <div className={s.featuredImage}>
                                                                                        <Link href={getLocalizedHref(`/products/${product.slug}`, lang)} className={s.featuredImageLink}>
                                                                                            <Image
                                                                                                src={mainImage || "/images/product-placeholder.svg"}
                                                                                                alt={product.name}
                                                                                                fill
                                                                                                draggable={false}
                                                                                            />
                                                                                        </Link>
                                                                                        {badgeText && (
                                                                                            <Badge 
                                                                                                variant={badgeText.toLowerCase() === "new" ? "new" : "sale"} 
                                                                                                className={s.featuredBadge}
                                                                                            >
                                                                                                {badgeText}
                                                                                            </Badge>
                                                                                        )}
                                                                                        <div className={s.featuredWeightOverlay}>
                                                                                            {displayWeight}
                                                                                        </div>
                                                                                        <WishButton productId={String(product.id)} className={s.wishBtn} />
                                                                                    </div>
                                                                                    <div className={s.featuredInfo}>
                                                                                        <div className={s.featuredName}>
                                                                                            <Link href={getLocalizedHref(`/products/${product.slug}`, lang)}>
                                                                                                {product.name}
                                                                                            </Link>
                                                                                        </div>
                                                                                        <div className={s.featuredFooter}>
                                                                                            <div className={s.featuredPriceBlock}>
                                                                                                <div className={clsx(s.featuredPriceValue, hasPromo && s.featuredNewPrice)}>
                                                                                                    {product.cost} ₴
                                                                                                </div>
                                                                                                {hasPromo && product.oldCost && (
                                                                                                    <div className={s.featuredOldPrice}>
                                                                                                        {product.oldCost} ₴
                                                                                                    </div>
                                                                                                )}
                                                                                                <div className={s.featuredPriceUnit}>{displayUnit}</div>
                                                                                            </div>
                                                                                            <AddToCartButton productId={String(product.id)} className={s.addToCartBtn} hasCostVariants={product.hasCostVariants} />
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </SwiperSlide>
                                                                        );
                                                                    })}
                                                                </Swiper>
                                                            </div>
                                                        ) : (
                                                            <div className={s.featuredCard}>
                                                                <div className={s.featuredImage}>
                                                                    <Link href={getLocalizedHref(`/products/${featuredProposals[0].slug}`, lang)} className={s.featuredImageLink}>
                                                                        <Image
                                                                            src={resolveProductImageUrl(featuredProposals[0]) || "/images/product-placeholder.svg"}
                                                                            alt={featuredProposals[0].name}
                                                                            fill
                                                                            draggable={false}
                                                                        />
                                                                    </Link>
                                                                    {(() => {
                                                                        const badgeText = getProductBadge(featuredProposals[0], String(lang));
                                                                        return badgeText ? (
                                                                            <Badge 
                                                                                variant={badgeText.toLowerCase() === "new" ? "new" : "sale"}
                                                                                className={s.featuredBadge}
                                                                            >
                                                                                {badgeText}
                                                                            </Badge>
                                                                        ) : null;
                                                                    })()}
                                                                    <div className={s.featuredWeightOverlay}>
                                                                        {(() => {
                                                                            const fallbackWeight = featuredProposals[0].specifications?.find(s => s.name.toLowerCase().includes('вага'))?.values[0] || featuredProposals[0].unit;
                                                                            return fallbackWeight === "1"
                                                                                ? (lang === 'ru' ? "1 единица" : "1 одиниця")
                                                                                : fallbackWeight;
                                                                        })()}
                                                                    </div>
                                                                    <WishButton productId={String(featuredProposals[0].id)} className={s.wishBtn} />
                                                                </div>
                                                                <div className={s.featuredInfo}>
                                                                    <div className={s.featuredName}>
                                                                        <Link href={getLocalizedHref(`/products/${featuredProposals[0].slug}`, lang)}>
                                                                            {featuredProposals[0].name}
                                                                        </Link>
                                                                    </div>
                                                                    <div className={s.featuredFooter}>
                                                                        <div className={s.featuredPriceBlock}>
                                                                            {(() => {
                                                                                const badgeText = getProductBadge(featuredProposals[0], String(lang));
                                                                                const hasPromo = badgeText && (badgeText === 'АКЦІЯ' || badgeText === 'АКЦИЯ');
                                                                                return (
                                                                                    <>
                                                                                        <div className={clsx(s.featuredPriceValue, hasPromo && s.featuredNewPrice)}>
                                                                                            {featuredProposals[0].cost} ₴
                                                                                        </div>
                                                                                        {hasPromo && featuredProposals[0].oldCost && (
                                                                                            <div className={s.featuredOldPrice}>
                                                                                                {featuredProposals[0].oldCost} ₴
                                                                                            </div>
                                                                                        )}
                                                                                    </>
                                                                                );
                                                                            })()}
                                                                            <div className={s.featuredPriceUnit}>
                                                                                {(() => {
                                                                                    const unit = featuredProposals[0].unit;
                                                                                    return unit.toLowerCase() === "шт"
                                                                                        ? "За 1 шт"
                                                                                        : `За ${unit}`;
                                                                                })()}
                                                                            </div>
                                                                        </div>
                                                                        <AddToCartButton productId={String(featuredProposals[0].id)} className={s.addToCartBtn} hasCostVariants={featuredProposals[0].hasCostVariants} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className={s.emptyPrompt}>{lang === 'ru' ? 'Нет предложений' : 'Немає пропозицій'}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
