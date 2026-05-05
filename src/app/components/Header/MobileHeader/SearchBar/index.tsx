"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import clsx from "clsx";
import s from "./SearchBar.module.scss";
import { useScrollLock } from "@/hooks/useScrollLock";

import { 
    getProductsApi, 
    resolveProductImageUrl, 
    Product 
} from "@/lib/graphql/queries/products";

// Removed MOCKs

export default function SearchBar() {
    const [query, setQuery] = useState("");
    const [isActive, setIsActive] = useState(false);
    const [results, setResults] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const router = useRouter();
    const params = useParams();
    const { disableScroll, enableScroll } = useScrollLock();
    const lang = params?.lang || "uk";
    const containerRef = useRef<HTMLDivElement>(null);

    const handleSearch = (e?: React.SyntheticEvent) => {
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
        disableScroll();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        setHasError(false);
    };

    // Debounced search
    useEffect(() => {
        if (query.trim().length < 3) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const res = await getProductsApi({ search: query, limit: 6 }, String(lang));
                setResults(res.data);
            } catch (error) {
                console.error("Mobile search error:", error);
            } finally {
                setIsLoading(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [query, lang]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsActive(false);
                enableScroll();
            }
        };

        if (isActive) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [enableScroll, isActive]);

    return (
        <>
            {isActive && <div className={s.overlay} onClick={() => setIsActive(false)} />}

            <div className={clsx(s.searchBar, isActive && s.active, hasError && s.error)} ref={containerRef}>
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
                                    <div key={product.id} className={s.resultItem} onClick={() => router.push(`/${lang}/product/${product.slug || product.id}`)}>
                                        <div className={s.resultImage}>
                                            <img src={resolveProductImageUrl(product) || "/images/no-image.png"} alt={product.name} />
                                        </div>
                                        <div className={s.resultInfo}>
                                            <div className={s.resultName}>{product.name}</div>
                                            <div className={s.resultPrice}>{product.cost} ₴</div>
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
