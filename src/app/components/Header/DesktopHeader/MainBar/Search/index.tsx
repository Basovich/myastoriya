"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import s from "./Search.module.scss";
import { useScrollLock } from "@/hooks/useScrollLock";
import Image from "next/image";
import Link from "next/link";

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

export default function Search() {
    const [query, setQuery] = useState("");
    const [isActive, setIsActive] = useState(false);
    const [results, setResults] = useState<typeof MOCK_PRODUCTS>([]);
    const [featuredProposals, setFeaturedProposals] = useState<typeof MOCK_FEATURED>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [dragOffset, setDragOffset] = useState(0);
    const [hasError, setHasError] = useState(false);
    const router = useRouter();
    const params = useParams();
    const lang = params?.lang || "uk";
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
        fetchSearchData(value);
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
                    <img src="/icons/icon-search.svg" alt="Search" width="20" height="20" />
                </div>
                <div className={s.placeholderText}>Я шукаю...</div>
                <button className={s.headerSearchBtn}>пошук</button>
            </div>

            {isActive && (
                <div className={s.searchOverlay}>
                    <div className={s.searchBlock}>
                        <div className={s.topBar}>
                            <div className={s.topBarContainer}>
                                <div className={s.logoSide}>
                                    <Link href="/" className={s.overlayLogoLink}>
                                        <img src="/images/logo-black.svg" alt="М'ясторія" width={114} height={33} />
                                    </Link>
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
                                    {query && (
                                        <button className={s.clearBtn} onClick={() => setQuery("")}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M18 6L6 18M6 6L18 18" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                                <button className={s.closeOverlayBtn} onClick={() => setIsActive(false)}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M18 6L6 18M6 6L18 18" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                                <div className={s.rightSeparator} />
                                <button className={s.searchBtnIcon} onClick={handleSearch}>
                                    <img src="/icons/icon-search.svg" alt="Search" width="22" height="22" />
                                </button>
                            </div>
                        </div>

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
                                        <img src="/icons/icon-search.svg" alt="Search" width="16" height="16" />
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
                                    {isLoading ? (
                                        <div className={s.loadingPlaceholder}>Завантаження...</div>
                                    ) : featuredProposals.length > 0 ? (
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
                    </div>
                    <div className={s.backdrop} onClick={() => setIsActive(false)} />
                </div>
            )}
        </div>
    );
}
