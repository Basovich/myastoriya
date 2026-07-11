"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";
import ProductCard from "@/app/components/ui/ProductCard/ProductCard";
import ProductCardRow from "@/app/components/ui/ProductCardRow";
import Button from "@/app/components/ui/Button/Button";
import type { Product, ProductsResponse } from "@/lib/graphql";
import { resolveProductImageUrl, getProductsApi, getProductWeight, getProductsFilterApi, getProductBadge } from "@/lib/graphql";
import type { FilterStateInput } from "@/lib/graphql";
import { Locale } from "@/i18n/config";
import s from "../CatalogContent/CatalogContent.module.scss";
import Pagination from "@/app/components/ui/Pagination/Pagination";

interface CatalogProductsClientProps {
    initialProducts: ProductsResponse;
    categoryId?: number;
    view?: 'list' | 'grid';
    lang: Locale;
    sort?: string;
    activeFilters?: FilterStateInput[];
}

export default function CatalogProductsClient({
    initialProducts,
    categoryId,
    view = "list",
    lang,
    sort,
    activeFilters,
}: CatalogProductsClientProps) {
    const [products, setProducts] = useState<Product[]>(initialProducts.data);
    const [currentPage, setCurrentPage] = useState(initialProducts.current_page);
    const [hasMorePages, setHasMorePages] = useState(initialProducts.has_more_pages);
    const [isLoading, setIsLoading] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const [isPaginating, setIsPaginating] = useState(false);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        let isCurrent = true;
        getProductsFilterApi(categoryId, lang, activeFilters)
            .then((data) => {
                if (isCurrent && data) {
                    setTotalItems(data.productsCount || 0);
                }
            })
            .catch((err) => {
                console.error("Error fetching filters/count:", err);
            });
        return () => {
            isCurrent = false;
        };
    }, [categoryId, lang, activeFilters]);

    const totalPages = Math.ceil(totalItems / 12);

    useEffect(() => {
        const handleStart = () => setIsNavigating(true);
        window.addEventListener("catalog-loading-start", handleStart);
        return () => window.removeEventListener("catalog-loading-start", handleStart);
    }, []);

    // Official React pattern for synchronizing state with props on change:
    const [prevInitialProducts, setPrevInitialProducts] = useState(initialProducts);
    const [prevActiveFilters, setPrevActiveFilters] = useState(activeFilters);
    const [prevSort, setPrevSort] = useState(sort);
    const [prevCategoryId, setPrevCategoryId] = useState(categoryId);

    if (
        initialProducts !== prevInitialProducts ||
        activeFilters !== prevActiveFilters ||
        sort !== prevSort ||
        categoryId !== prevCategoryId
    ) {
        setProducts(initialProducts.data);
        setCurrentPage(initialProducts.current_page);
        setHasMorePages(initialProducts.has_more_pages);
        setPrevInitialProducts(initialProducts);
        setPrevActiveFilters(activeFilters);
        setPrevSort(sort);
        setPrevCategoryId(categoryId);
        setIsNavigating(false);
    }

    const handleLoadMore = async () => {
        if (isLoading || !hasMorePages) return;
        setIsLoading(true);

        const scrollTop = window.scrollY;

        try {
            const nextPage = currentPage + 1;
            const newProductsRes = await getProductsApi({
                categoryId,
                limit: 12,
                page: nextPage,
                sort,
                filter: activeFilters && activeFilters.length > 0 ? activeFilters : undefined,
            }, lang);

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

    const handlePageChange = async (page: number) => {
        if (isLoading || isPaginating || isNavigating || page === currentPage) return;
        setIsPaginating(true);

        try {
            const newProductsRes = await getProductsApi({
                categoryId,
                limit: 12,
                page: page,
                sort,
                filter: activeFilters && activeFilters.length > 0 ? activeFilters : undefined,
            }, lang);

            setProducts(newProductsRes.data);
            setCurrentPage(page);
            setHasMorePages(newProductsRes.has_more_pages);

            // Update URL search parameter page
            const params = new URLSearchParams(window.location.search);
            params.set("page", page.toString());
            window.history.replaceState(
                null,
                "",
                `${window.location.pathname}?${params.toString()}`
            );

            // Scroll to top of the catalog page smoothly
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err) {
            console.error("Error loading products page:", err);
        } finally {
            setIsPaginating(false);
        }
    };

    return (
        <div className={s.results}>
            <div className={clsx(s.productList, view === "grid" && s.productListGrid, products.length === 0 && s.noResultsList)}>
                {(isNavigating || isPaginating) && (
                    <div className={s.loadingOverlay} />
                )}
                {products.length > 0 ? (
                    products.map((product) =>
                        view === "grid" ? (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                slug={product.slug}
                                title={product.name}
                                weight={getProductWeight(product)}
                                price={product.cost}
                                oldPrice={product.oldCost ?? undefined}
                                unit={product.unit}
                                badge={getProductBadge(product, lang)}
                                image={resolveProductImageUrl(product)}
                                lang={lang}
                                hasCostVariants={product.hasCostVariants}
                            />
                        ) : (
                            <ProductCardRow
                                key={product.id}
                                id={product.id}
                                slug={product.slug}
                                title={product.name}
                                weight={getProductWeight(product)}
                                price={product.cost}
                                oldPrice={product.oldCost ?? undefined}
                                unit={product.unit}
                                badge={getProductBadge(product, lang)}
                                image={resolveProductImageUrl(product)}
                                lang={lang}
                                hasCostVariants={product.hasCostVariants}
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
                        disabled={isLoading || isNavigating}
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

            {totalPages > 1 && (
                <div className={clsx(s.paginationRow, !hasMorePages && s.noShowMore)}>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </div>
    );
}
