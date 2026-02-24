"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import s from "./SearchBar.module.scss";

const MOCK_PRODUCTS = [
    { id: 1, name: "Трюфельный стейк Dry-aged", price: 1260, image: "/images/products/steak-1.jpg" },
    { id: 2, name: "Стейк бокс Классический", price: 4200, image: "/images/products/steak-2.jpg" },
    { id: 3, name: "Стейк бокс Dry Aged", price: 5500, image: "/images/products/steak-3.jpg" },
    { id: 4, name: "Стейк Рибай выдержанный", price: 1800, image: "/images/products/steak-4.jpg" },
];

export default function SearchBar() {
    const [query, setQuery] = useState("");
    const [isActive, setIsActive] = useState(false);
    const [results, setResults] = useState<typeof MOCK_PRODUCTS>([]);
    const [hasError, setHasError] = useState(false);
    const router = useRouter();
    const params = useParams();
    const lang = params?.lang || "uk";
    const containerRef = useRef<HTMLDivElement>(null);

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        setHasError(false);

        if (value.toLowerCase().includes("стейк")) {
            setResults(MOCK_PRODUCTS);
        } else if (value.trim() === "") {
            setResults([]);
        } else {
            setResults([]); // Will show "not found" state
        }
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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

    return (
        <>
            {isActive && <div className={s.overlay} onClick={() => setIsActive(false)} />}

            <div className={`${s.searchBar} ${isActive ? s.active : ""} ${hasError ? s.error : ""}`} ref={containerRef}>
                <div className={s.searchInputWrapper}>
                    <svg className={s.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        className={s.searchInput}
                        placeholder="Я шукаю..."
                        value={query}
                        onFocus={handleInputFocus}
                        onChange={handleInputChange}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <button className={s.searchBtn} onClick={handleSearch}>ПОШУК</button>
                </div>

                {isActive && query.trim() !== "" && (
                    <div className={s.dropdown}>
                        {results.length > 0 ? (
                            <div className={s.resultsList}>
                                {results.map((product) => (
                                    <div key={product.id} className={s.resultItem} onClick={() => router.push(`/${lang}/search?q=${encodeURIComponent(product.name)}`)}>
                                        <div className={s.resultImage}>
                                            <div className={s.imagePlaceholder} />
                                        </div>
                                        <div className={s.resultInfo}>
                                            <div className={s.resultName}>{product.name}</div>
                                            <div className={s.resultPrice}>{product.price} ₴</div>
                                        </div>
                                    </div>
                                ))}
                                <button className={s.showAll} onClick={handleSearch}>
                                    Показати всі результати
                                </button>
                            </div>
                        ) : (
                            <div className={s.noResults}>
                                Товарів не знайдено
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
