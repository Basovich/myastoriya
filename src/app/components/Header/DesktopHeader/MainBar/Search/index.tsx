"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
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
import { 
    getProductsApi, 
    getSearchCategoriesApi, 
    getSearchPopularQueriesApi, 
    resolveProductImageUrl, 
    Product, 
    ProductCategory 
} from "@/lib/graphql/queries/products";

// Removed MOCKs

interface CategoryLinkProps {
    cat: ProductCategory;
    lang: string;
    router: any;
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
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [dragOffset, setDragOffset] = useState(0);
    const [hasError, setHasError] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const containerRef = useRef<HTMLDivElement>(null);
    const { disableScroll, enableScroll } = useScrollLock();

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!query.trim()) {
            setHasError(true);
            return;
        }

        router.push(getLocalizedHref(`/search?q=${encodeURIComponent(query)}`, lang));
        setIsActive(false);
        setShowOverlay(false);
    };

    const handleInputFocus = () => {
        setIsActive(true);
        setHasError(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        setHasError(false);

        if (value.length >= 3) {
            setShowOverlay(true);
        } else {
            setShowOverlay(false);
            setResults([]);
            setSearchCategories([]);
        }
    };
    
    // Close overlay on pathname change
    useEffect(() => {
        setIsActive(false);
    }, [pathname]);

    // Initial data fetch when active
    useEffect(() => {
        if (isActive) {
            // Fetch popular queries and featured products
            getSearchPopularQueriesApi(undefined, 6, lang).then(setPopularQueries).catch(console.error);
            // Using products with limit 5 for featured proposals
            getProductsApi({ limit: 5 }, lang).then(res => setFeaturedProposals(res.data)).catch(console.error);
        }
    }, [isActive, lang]);

    // Debounced search fetch
    useEffect(() => {
        if (query.length < 3) return;

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const prodRes = await getProductsApi({ search: query, limit: 6 }, lang);
                setResults(prodRes.data);

                // Local tree filtering for categories to show hierarchy
                if (categories) {
                    const findMatches = (list: ProductCategory[], forceInclude: boolean = false): ProductCategory[] => {
                        const matches: ProductCategory[] = [];
                        for (const cat of list) {
                            const nameMatch = cat.name.toLowerCase().includes(query.toLowerCase());
                            const shouldInclude = forceInclude || nameMatch;
                            
                            const childMatches = cat.children ? findMatches(cat.children, shouldInclude) : [];
                            
                            if (shouldInclude || childMatches.length > 0) {
                                matches.push({
                                    ...cat,
                                    children: childMatches
                                });
                            }
                        }
                        return matches;
                    };
                    setSearchCategories(findMatches(categories));
                } else {
                    const catRes = await getSearchCategoriesApi(query, lang);
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

    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDragging(true);
        const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
        setStartX(pageX - dragOffset);
    };

    const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging) return;
        const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
        const newOffset = pageX - startX;
        setDragOffset(newOffset);
    };

    const handleDragEnd = () => {
        if (!isDragging) return;
        setIsDragging(false);

        const threshold = 100;
        if (dragOffset < -threshold && currentSlide < featuredProposals.length - 1) {
            setCurrentSlide(prev => prev + 1);
        } else if (dragOffset > threshold && currentSlide > 0) {
            setCurrentSlide(prev => prev - 1);
        }
        setDragOffset(0);
    };

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
                <div className={s.placeholderText}>Я шукаю...</div>
                <button className={s.headerSearchBtn}>пошук</button>
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
                                        placeholder="Я шукаю..."
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
                                            <h3 className={s.colTitle}>Категорії</h3>
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
                                                    <li className={s.noResultsInline}>Нічого не знайдено</li>
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
                                                <h3 className={s.colTitle}>Страви</h3>
                                                <div className={s.titleIcon}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><g opacity="0.5"><path d="M8.12988 2.7124C11.1214 2.71258 13.5459 5.13784 13.5459 8.12939C13.5458 9.47077 13.0547 10.7039 12.2383 11.6538L12.4717 11.8794H13.1299L17.2881 16.0454L16.0459 17.2876L11.8799 13.1294V12.4712L11.6543 12.2378C10.7044 13.0542 9.47126 13.5453 8.12988 13.5454C5.13833 13.5454 2.71307 11.1209 2.71289 8.12939C2.71289 5.13773 5.13822 2.7124 8.12988 2.7124ZM8.12988 4.37939C6.05488 4.37939 4.37988 6.05439 4.37988 8.12939C4.38006 10.2042 6.05499 11.8794 8.12988 11.8794C10.2046 11.8792 11.8797 10.2041 11.8799 8.12939C11.8799 6.0545 10.2047 4.37957 8.12988 4.37939Z" fill="black" /></g></svg>
                                                </div>
                                            </div>
                                            <div className={s.dishListContainer}>
                                                <div className={s.dishList}>
                                                    {results.length > 0 ? (
                                                        results.map((product) => {
                                                            const mainImage = resolveProductImageUrl(product);
                                                            const weight = product.specifications?.find(s => s.name.toLowerCase().includes('вага'))?.values[0] || product.unit;
                                                            
                                                            return (
                                                                <div key={product.id} className={s.dishItem} onClick={() => router.push(`/${lang}/product/${product.slug || product.id}`)}>
                                                                    <div className={s.dishThumb}>
                                                                        <Image src={mainImage || "/images/no-image.png"} alt={product.name} fill />
                                                                    </div>
                                                                    <div className={s.dishInfo}>
                                                                        <div className={s.dishName}>{product.name}</div>
                                                                        <div className={s.dishWeight}>{weight}</div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    ) : !isLoading ? (
                                                        <div className={s.emptyPrompt}>Товарів не знайдено</div>
                                                    ) : (
                                                        <div className={s.emptyPrompt}>Пошук...</div>
                                                    )}
                                                </div>
                                            </div>
                                            <button className={s.showAllResults} onClick={handleSearch}>
                                                Показати всі результати
                                            </button>
                                        </div>

                                        <div className={s.colSuggestions}>
                                            <h3 className={s.colTitle}>Кращі пропозиції за пошуком</h3>
                                            <div className={s.suggestionsContainer}>
                                                {featuredProposals.length > 0 ? (
                                                    <>
                                                        {featuredProposals.length > 1 ? (
                                                            <div
                                                                className={clsx(s.sliderWrapper, isDragging && s.dragging)}
                                                                onMouseDown={handleDragStart}
                                                                onMouseMove={handleDragMove}
                                                                onMouseUp={handleDragEnd}
                                                                onMouseLeave={handleDragEnd}
                                                                onTouchStart={handleDragStart}
                                                                onTouchMove={handleDragMove}
                                                                onTouchEnd={handleDragEnd}
                                                            >
                                                                <div
                                                                    className={s.sliderInner}
                                                                    style={{
                                                                        transform: `translateX(calc(-${currentSlide * 100}% + ${dragOffset}px))`,
                                                                        transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                                                                    }}
                                                                >
                                                                    {featuredProposals.map((product) => {
                                                                        const mainImage = resolveProductImageUrl(product);
                                                                        const weight = product.specifications?.find(s => s.name.toLowerCase().includes('вага'))?.values[0] || product.unit;
                                                                        const badgeText = product.oldCost ? 'акція' : (product.is_new ? 'new' : null);

                                                                        return (
                                                                            <div key={product.id} className={s.featuredCardSlide}>
                                                                                <div className={s.featuredCard}>
                                                                                    <div className={s.featuredImage}>
                                                                                        <Image
                                                                                            src={mainImage || "/images/no-image.png"}
                                                                                            alt={product.name}
                                                                                            fill
                                                                                            draggable={false}
                                                                                        />
                                                                                        {badgeText && <Badge variant={badgeText === "new" ? "new" : "sale"} className={s.featuredBadge}>{badgeText}</Badge>}
                                                                                        <div className={s.featuredWeightOverlay}>
                                                                                            {weight}
                                                                                        </div>
                                                                                        <WishButton productId={String(product.id)} className={s.wishBtn} />
                                                                                    </div>
                                                                                    <div className={s.featuredInfo}>
                                                                                        <div className={s.featuredName}>{product.name}</div>
                                                                                        <div className={s.featuredFooter}>
                                                                                            <div className={s.featuredPriceBlock}>
                                                                                                <div className={s.featuredPriceValue}>{product.cost} ₴</div>
                                                                                                <div className={s.featuredPriceUnit}>{product.unit}</div>
                                                                                            </div>
                                                                                            <AddToCartButton productId={String(product.id)} className={s.addToCartBtn} />
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className={s.featuredCard}>
                                                                <div className={s.featuredImage}>
                                                                    <Image
                                                                        src={resolveProductImageUrl(featuredProposals[0]) || "/images/no-image.png"}
                                                                        alt={featuredProposals[0].name}
                                                                        fill
                                                                        draggable={false}
                                                                    />
                                                                    {(featuredProposals[0].oldCost || featuredProposals[0].is_new) && (
                                                                        <Badge 
                                                                            variant={featuredProposals[0].is_new ? "new" : "sale"} 
                                                                            className={s.featuredBadge}
                                                                        >
                                                                            {featuredProposals[0].oldCost ? 'акція' : 'new'}
                                                                        </Badge>
                                                                    )}
                                                                    <div className={s.featuredWeightOverlay}>
                                                                        {featuredProposals[0].specifications?.find(s => s.name.toLowerCase().includes('вага'))?.values[0] || featuredProposals[0].unit}
                                                                    </div>
                                                                    <WishButton productId={String(featuredProposals[0].id)} className={s.wishBtn} />
                                                                </div>
                                                                <div className={s.featuredInfo}>
                                                                    <div className={s.featuredName}>{featuredProposals[0].name}</div>
                                                                    <div className={s.featuredFooter}>
                                                                        <div className={s.featuredPriceBlock}>
                                                                            <div className={s.featuredPriceValue}>{featuredProposals[0].cost} ₴</div>
                                                                            <div className={s.featuredPriceUnit}>{featuredProposals[0].unit}</div>
                                                                        </div>
                                                                        <AddToCartButton productId={String(featuredProposals[0].id)} className={s.addToCartBtn} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {featuredProposals.length > 2 && (
                                                            <div className={s.dots}>
                                                                {featuredProposals.map((_, index) => (
                                                                    <span
                                                                        key={index}
                                                                        className={currentSlide === index ? s.dotActive : ""}
                                                                        onClick={() => setCurrentSlide(index)}
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className={s.emptyPrompt}>Немає пропозицій</div>
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
