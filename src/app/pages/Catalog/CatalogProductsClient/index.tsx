"use client";

import { useState } from "react";
import clsx from "clsx";
import ProductCard from "@/app/components/ui/ProductCard/ProductCard";
import ProductCardRow from "@/app/components/ui/ProductCardRow";
import Button from "@/app/components/ui/Button/Button";
import type { Product, ProductsResponse } from "@/lib/graphql";
import { resolveProductImageUrl } from "@/lib/graphql";
import { Locale } from "@/i18n/config";
import s from "../CatalogContent/CatalogContent.module.scss";

function getBadge(product: Product): string | null {
    if (product.is_new) return 'NEW';
    if (product.oldCost && product.oldCost > product.cost) return 'АКЦІЯ';
    return null;
}

function getWeight(product: Product): string {
    const weightSpec = product.specifications?.find(sp =>
        sp.name.toLowerCase().includes('вага') ||
        sp.name.toLowerCase().includes("об'єм")
    );
    if (weightSpec && weightSpec.values.length > 0) return weightSpec.values[0];
    return product.multiplier ? `${product.multiplier}` : '';
}

interface CatalogProductsClientProps {
    initialProducts: ProductsResponse;
    categoryId?: number;
    view?: 'list' | 'grid';
    lang: Locale;
    sort?: string;
}

export default function CatalogProductsClient({
    initialProducts,
    categoryId,
    view = "list",
    lang,
    sort,
}: CatalogProductsClientProps) {
    const [products, setProducts] = useState<Product[]>(initialProducts.data);
    const [currentPage, setCurrentPage] = useState(initialProducts.current_page);
    const [hasMorePages, setHasMorePages] = useState(initialProducts.has_more_pages);
    const [isLoading, setIsLoading] = useState(false);

    // Official React pattern for synchronizing state with props on change:
    const [prevInitialProducts, setPrevInitialProducts] = useState(initialProducts);
    if (initialProducts !== prevInitialProducts) {
        setProducts(initialProducts.data);
        setCurrentPage(initialProducts.current_page);
        setHasMorePages(initialProducts.has_more_pages);
        setPrevInitialProducts(initialProducts);
    }

    const handleLoadMore = async () => {
        if (isLoading || !hasMorePages) return;
        setIsLoading(true);

        const scrollTop = window.scrollY;

        try {
            const nextPage = currentPage + 1;
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };
            if (lang === "ru") {
                headers["Content-Language"] = "ru_RU";
            } else {
                headers["Content-Language"] = "uk_UA";
            }

            const response = await fetch("/api/products", {
                method: "POST",
                headers,
                body: JSON.stringify({
                    categoryId,
                    limit: 12,
                    page: nextPage,
                    sort,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to load products");
            }

            const newProductsRes: ProductsResponse = await response.json();
            
            // Append products
            setProducts((prev) => [...prev, ...newProductsRes.data]);
            setCurrentPage(nextPage);
            setHasMorePages(newProductsRes.has_more_pages);

            // Update URL search parameter page without scrolling or page re-fetching
            const params = new URLSearchParams(window.location.search);
            params.set("page", nextPage.toString());
            window.history.replaceState(
                null,
                "",
                `${window.location.pathname}?${params.toString()}`
            );

            // Restore scroll position to prevent browser scroll anchoring jumps
            requestAnimationFrame(() => {
                window.scrollTo(0, scrollTop);
                setTimeout(() => {
                    window.scrollTo(0, scrollTop);
                }, 0);
            });
        } catch (err) {
            console.error("Error loading more products:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={s.results}>
            <div className={clsx(s.productList, view === "grid" && s.productListGrid)}>
                {products.length > 0 ? (
                    products.map((product) =>
                        view === "grid" ? (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                slug={product.slug}
                                title={product.name}
                                weight={getWeight(product)}
                                price={product.cost}
                                unit={product.unit}
                                badge={getBadge(product)}
                                image={resolveProductImageUrl(product)}
                                lang={lang}
                            />
                        ) : (
                            <ProductCardRow
                                key={product.id}
                                id={product.id}
                                slug={product.slug}
                                title={product.name}
                                weight={getWeight(product)}
                                price={product.cost}
                                oldPrice={product.oldCost ?? undefined}
                                unit={product.unit}
                                badge={getBadge(product)}
                                image={resolveProductImageUrl(product)}
                                lang={lang}
                            />
                        )
                    )
                ) : (
                    <div className={s.noResults}>
                        {lang === "ua" ? "Товарів не знайдено" : "Товаров не найдено"}
                    </div>
                )}
            </div>

            {hasMorePages && (
                <div className={s.showMoreWrap}>
                    <Button
                        variant="outline-black"
                        onClick={handleLoadMore}
                        className={s.showMoreBtn}
                        disabled={isLoading}
                    >
                        <span className={s.showMoreText}>
                            {isLoading
                                ? (lang === "ua" ? "ЗАВАНТАЖЕННЯ..." : "ЗАГРУЗКА...")
                                : (lang === "ua" ? "ПОКАЗАТИ ЩЕ" : "ПОКАЗАТЬ ЕЩЕ")}
                        </span>
                        {!isLoading && (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
