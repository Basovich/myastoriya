"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import s from "./Search.module.scss";
import { useScrollLock } from "@/hooks/useScrollLock";
import Image from "next/image";
import Logo from "@/app/components/Header/Shared/Logo";
import { Locale } from "@/i18n/config";

const MOCK_PRODUCTS = [
    { id: 1, name: "Стейк Рібай Dry-aged гриль - М'ясторія", price: 1260, weight: "330г / 340г / 200г", image: "/images/products/product-shashlik.png" },
    { id: 2, name: "Стейк Рібай на кістці Dry-aged гриль - М'ясторія", price: 4200, weight: "330г / 340г / 200г", image: "/images/products/product-meatballs.png" },
    { id: 3, name: "Стейк Рібай Dry-aged гриль - М'ясторія", price: 5500, weight: "330г / 340г / 200г", image: "/images/products/product-sticks-cheese.png" },
];

const MOCK_FEATURED = [
    {
        id: 101,
        name: "Мясные палочки с сыром",
        price: 2500,
        weight: "330г / 340г / 200г",
        image: "/images/product-sticks-cheese.jpg",
        badge: "акція"
    },
    {
        id: 102,
        name: "Стейк Рібай витриманий",
        price: 1800,
        weight: "300г / 350г",
        image: "/images/product-ribeye.jpg",
        badge: "новинка"
    },
    {
        id: 103,
        name: "Шашлик зі свинини",
        price: 350,
        weight: "500г",
        image: "/images/product-shashlik.jpg",
        badge: "популярне"
    }
];

export default function Search({ lang }: { lang: Locale }) {
    const [query, setQuery] = useState("");
    const [isActive, setIsActive] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false);
    const [results, setResults] = useState<typeof MOCK_PRODUCTS>([]);
    const [featuredProposals, setFeaturedProposals] = useState<typeof MOCK_FEATURED>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [dragOffset, setDragOffset] = useState(0);
    const [hasError, setHasError] = useState(false);
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const { disableScroll, enableScroll } = useScrollLock();

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!query.trim()) {
            setHasError(true);
            return;
        }

        router.push(`/${lang}/search?q=${encodeURIComponent(query)}`);
        setIsActive(false);
        setShowOverlay(false);
    };

    const handleInputFocus = () => {
        setIsActive(true);
        setHasError(false);
    };

    const fetchSearchData = async (searchTerm: string) => {
        setIsLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 600));

        if (searchTerm.toLowerCase().includes("стейк")) {
            setResults(MOCK_PRODUCTS);
            setFeaturedProposals(MOCK_FEATURED);
        } else if (searchTerm.trim() === "") {
            setResults([]);
            setFeaturedProposals([]);
        } else {
            setResults([]);
            setFeaturedProposals(MOCK_FEATURED.slice(0, 1)); // Show one if no specific results
        }
        setIsLoading(false);
        setCurrentSlide(0);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        setHasError(false);

        if (value.length >= 3) {
            setShowOverlay(true);
            fetchSearchData(value);
        } else {
            setShowOverlay(false);
            setResults([]);
        }
    };

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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsActive(false);
            }
        };

        if (isActive) {
            document.addEventListener("mousedown", handleClickOutside);
            disableScroll();
        } else {
            setShowOverlay(false);
            enableScroll();
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            enableScroll();
        };
    }, [isActive, disableScroll, enableScroll]);

    return (
        <div className={`${s.searchContainer} ${isActive ? s.active : ""}`} ref={containerRef}>
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
                                    {query && (
                                        <button className={s.clearBtn} onClick={() => setIsActive(false)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="black" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                                <div className={s.rightSeparator} />
                                <button className={s.searchBtnIcon} onClick={handleSearch} aria-label="Search">
                                    <Image src="/icons/icon-search-red.svg" alt="Search" width="22" height="22" />
                                </button>
                            </div>
                        </div>

                        {showOverlay && (
                            isLoading ? null : (
                                results.length === 0 ? (
                                    <div className={s.noResults}>
                                        {lang === 'ua' ? 'Товарів не знайдено' : 'Товаров не найдено'}
                                    </div>
                                ) : (
                                    <div className={s.contentBody}>
                                        <div className={s.colCategories}>
                                            <h3 className={s.colTitle}>Категорії</h3>
                                            <ul className={s.categoryList}>
                                                <li onClick={() => setQuery("Стейк Флет-Айрон")}>Стейк Флет-Айрон</li>
                                                <li>Інші альтернативні стейки</li>
                                                <li>Стейки</li>
                                                <li className={s.activeLink}>Стейки USA</li>
                                                <li>Фірмові стейки</li>
                                                <li>Стейк бокси</li>
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
                                                        results.map((product) => (
                                                            <div key={product.id} className={s.dishItem} onClick={() => router.push(`/${lang}/search?q=${encodeURIComponent(product.name)}`)}>
                                                                <div className={s.dishThumb}>
                                                                    <Image src={product.image} alt={product.name} fill />
                                                                </div>
                                                                <div className={s.dishInfo}>
                                                                    <div className={s.dishName}>{product.name}</div>
                                                                    <div className={s.dishWeight}>{product.weight}</div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className={s.emptyPrompt}>Почніть вводити назву товару...</div>
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
                                                        <div
                                                            className={`${s.sliderWrapper} ${isDragging ? s.dragging : ""}`}
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
                                                                {featuredProposals.map((product) => (
                                                                    <div key={product.id} className={s.featuredCardSlide}>
                                                                        <div className={s.featuredCard}>
                                                                            <div className={s.featuredImage}>
                                                                                <Image
                                                                                    src={product.image}
                                                                                    alt={product.name}
                                                                                    fill
                                                                                    draggable={false}
                                                                                />
                                                                                {product.badge && <div className={s.featuredBadge}>{product.badge}</div>}
                                                                                <div className={s.featuredWeightOverlay}>
                                                                                    {product.weight}
                                                                                </div>
                                                                                <button className={s.wishBtn}>
                                                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                        <path d="M20.84 4.60999C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.60999L12 5.66999L10.94 4.60999C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.1917 3.5783 3.16 4.60999C2.1283 5.64169 1.54871 7.04096 1.54871 8.49999C1.54871 9.95903 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6054C22.3095 9.9379 22.4518 9.22248 22.4518 8.49999C22.4518 7.77751 22.3095 7.06209 22.0329 6.39464C21.7563 5.72718 21.351 5.12077 20.84 4.60999V4.60999Z" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                                    </svg>
                                                                                </button>
                                                                            </div>
                                                                            <div className={s.featuredInfo}>
                                                                                <div className={s.featuredName}>{product.name}</div>
                                                                                <div className={s.featuredFooter}>
                                                                                    <div className={s.featuredPriceBlock}>
                                                                                        <div className={s.featuredPriceValue}>{product.price} ₴</div>
                                                                                        <div className={s.featuredPriceUnit}>упаковка</div>
                                                                                    </div>
                                                                                    <button className={s.addToCartBtn}>
                                                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                            <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                                        </svg>
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
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
                                )
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
