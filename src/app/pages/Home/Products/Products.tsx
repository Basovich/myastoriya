"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import clsx from "clsx";
import s from "./Products.module.scss";
import ProductCard from "../../../components/ui/ProductCard/ProductCard";
import Button from "../../../components/ui/Button/Button";
import SliderArrow from "../../../components/ui/SliderArrow/SliderArrow";
import Image from "next/image";
import { type Showcase, type Product, resolveProductImageUrl, getProductsApi, getProductWeight, getProductBadge } from "@/lib/graphql";
import { useAppSelector } from "@/store/hooks";

interface ProductsProps {
    dict: {
        tabs?: string[];
        showMoreButton: string;
    };
    showcases: Showcase[];
    initialProducts: Product[];
    initialHasMore?: boolean;
    /** SSR-дані товарів для всіх вітрин (ключ — showcase.id). */
    allShowcaseProducts?: Record<string, Product[]>;
    /** SSR-дані hasMore для всіх вітрин. */
    allShowcaseHasMore?: Record<string, boolean>;
}

// Кількість повторів масиву вітрин у слайдері.
// Слайдер починається з CENTER_REP-го повтору.
// Коли доходимо до межі (перший або останній повтор), робимо тихий стрибок назад у центр.
const REPEATS = 7;
const CENTER_REP = Math.floor(REPEATS / 2); // = 3

export default function Products({ dict, showcases, initialProducts, initialHasMore, allShowcaseProducts, allShowcaseHasMore }: ProductsProps) {
    const params = useParams();
    const locale = params?.lang as string;
    const token = useAppSelector((state) => state.auth.token) ?? undefined;
    const [activeTab, setActiveTab] = useState(0);

    // Ініціалізуємо map товарів з SSR-даних (або fallback до initialProducts для першої вітрини)
    const [productsMap, setProductsMap] = useState<Record<string, Product[]>>(() => {
        if (allShowcaseProducts && Object.keys(allShowcaseProducts).length > 0) {
            return allShowcaseProducts;
        }
        const firstId = showcases[0]?.id;
        return firstId ? { [firstId]: initialProducts } : {};
    });

    const [hasMoreMap, setHasMoreMap] = useState<Record<string, boolean>>(() => {
        if (allShowcaseHasMore && Object.keys(allShowcaseHasMore).length > 0) {
            return allShowcaseHasMore;
        }
        const firstId = showcases[0]?.id;
        return firstId ? { [firstId]: initialHasMore ?? true } : {};
    });

    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
    const [pageMap, setPageMap] = useState<Record<string, number>>({});
    const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
    const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);
    const [isLocked, setIsLocked] = useState(false);
    const swiperRef = useRef<SwiperType | null>(null);

    const currentShowcaseId = showcases[activeTab]?.id;
    const currentHasMore = hasMoreMap[currentShowcaseId] ?? false;
    const currentLoading = loadingMap[currentShowcaseId] ?? false;
    const currentPage = pageMap[currentShowcaseId] ?? 1;

    const fetchShowcaseProducts = useCallback(async (showcaseId: string, page: number, append: boolean) => {
        setLoadingMap((prev) => ({ ...prev, [showcaseId]: true }));
        try {
            const data = await getProductsApi(
                { showcaseId: parseInt(showcaseId), limit: 8, page },
                locale,
                token,
            );
            setProductsMap((prev) => ({
                ...prev,
                [showcaseId]: append
                    ? [...(prev[showcaseId] || []), ...(data.data || [])]
                    : (data.data || []),
            }));
            setHasMoreMap((prev) => ({ ...prev, [showcaseId]: data.has_more_pages }));
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setLoadingMap((prev) => ({ ...prev, [showcaseId]: false }));
        }
    }, [locale, token]);

    // При зміні таба — якщо немає SSR-даних для цієї вітрини, завантажити клієнтськи
    useEffect(() => {
        if (!currentShowcaseId) return;
        const hasData = productsMap[currentShowcaseId] && productsMap[currentShowcaseId].length > 0;
        if (!hasData) {
            void fetchShowcaseProducts(currentShowcaseId, 1, false);
            setPageMap((prev) => ({ ...prev, [currentShowcaseId]: 1 }));
        }
    }, [activeTab, currentShowcaseId]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleLoadMore = () => {
        if (!currentShowcaseId || currentLoading || !currentHasMore) return;
        const nextPage = currentPage + 1;
        setPageMap((prev) => ({ ...prev, [currentShowcaseId]: nextPage }));
        void fetchShowcaseProducts(currentShowcaseId, nextPage, true);
    };

    /**
     * Клік по вкладці: змінює активну вітрину і анімує слайдер до найближчого
     * екземпляра цього табу в DOM (щоб анімація була мінімальною).
     */
    const handleTabClick = (realIndex: number) => {
        setActiveTab(realIndex);
        const sw = swiperRef.current;
        if (!sw) return;

        const n = showcases.length;
        const currentIdx = sw.activeIndex;
        const currentRep = Math.floor(currentIdx / n);

        // Знаходимо найближчий екземпляр цього табу
        const candidates = [
            (currentRep - 1) * n + realIndex,
            currentRep * n + realIndex,
            (currentRep + 1) * n + realIndex,
        ].filter(idx => idx >= 0 && idx < REPEATS * n);

        const closest = candidates.reduce((best, c) =>
            Math.abs(c - currentIdx) < Math.abs(best - currentIdx) ? c : best
        );

        sw.slideTo(closest);
    };

    /**
     * Після завершення анімації переходу: якщо знаходимось у першому або
     * останньому повторі — тихо (без анімації, без колбеків) стрибаємо назад
     * до еквівалентної позиції у центральному повторі.
     * Це створює ефект нескінченної зацикленості без жодних DOM-маніпуляцій Swiper.
     */
    const handleTransitionEnd = (swiper: SwiperType) => {
        const n = showcases.length;
        const idx = swiper.activeIndex;
        const realIdx = idx % n;

        if (idx < n || idx >= (REPEATS - 1) * n) {
            const target = CENTER_REP * n + realIdx;
            swiper.slideTo(target, 0, false);
        }
    };

    if (!dict || !showcases || showcases.length === 0) return null;

    const sliderShowcases = Array(REPEATS).fill(showcases).flat();
    // Починаємо з центрального повтору, перший таб (realIndex=0)
    const initialSlide = CENTER_REP * showcases.length;

    return (
        <section className={s.wrapper}>
            <Image
                src="/images/products/products-bg-logo.svg"
                alt="Background logo watermark"
                width={786}
                height={1011}
                className={s.bgLogo}
            />
            <div className={s.section} id="products">
                <div className={clsx(s.tabsWrapper, isLocked && s.locked)}>
                    <SliderArrow
                        direction="left"
                        className={clsx(s.tabArrow, s.left)}
                        onClick={() => { }}
                        ariaLabel="Прокрутити вкладки вліво"
                        ref={setPrevEl}
                    />
                    <Swiper
                        key={showcases.length}
                        modules={[Navigation]}
                        navigation={{ prevEl, nextEl }}
                        loop={false}
                        initialSlide={initialSlide}
                        centeredSlides={true}
                        grabCursor={false}
                        simulateTouch={false}
                        allowTouchMove={true}
                        slidesPerView="auto"
                        spaceBetween={8}
                        onSwiper={(swiper) => {
                            swiperRef.current = swiper;
                            setIsLocked(swiper.isLocked);
                        }}
                        onTransitionEnd={handleTransitionEnd}
                        onInit={(swiper) => {
                            setIsLocked(swiper.isLocked);
                        }}
                        onUpdate={(swiper) => {
                            setIsLocked(swiper.isLocked);
                        }}
                        className={clsx(s.tabs, "products-tabs-swiper")}
                    >
                        {sliderShowcases.map((showcase, i) => {
                            const realIndex = i % showcases.length;
                            return (
                                <SwiperSlide
                                    key={`${showcase.id}-${i}`}
                                    className={s.tabSlide}
                                >
                                    <Button
                                        variant="pill"
                                        active={activeTab === realIndex}
                                        className={s.tabButton}
                                        onClick={() => handleTabClick(realIndex)}
                                    >
                                        {showcase.name}
                                    </Button>
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>
                    <SliderArrow
                        direction="right"
                        className={clsx(s.tabArrow, s.right)}
                        onClick={() => { }}
                        ariaLabel="Прокрутити вкладки вправо"
                        ref={setNextEl}
                    />
                </div>

                {/*
                  * Рендеримо гриди для ВСІХ вітрин — вміст завжди в HTML для SEO-павуків.
                  * Неактивні таби приховані через CSS клас tabHidden (display: none).
                  * JS переключає активний таб через стан activeTab.
                  */}
                {showcases.map((showcase, i) => {
                    const tabProducts = productsMap[showcase.id] || [];
                    const isActive = activeTab === i;
                    const isTabLoading = loadingMap[showcase.id] ?? false;

                    return (
                        <div
                            key={showcase.id}
                            className={clsx(
                                s.grid,
                                !isActive && s.tabHidden,
                                isActive && isTabLoading && s.loading,
                            )}
                            aria-hidden={!isActive || undefined}
                        >
                            {tabProducts.map((product, idx) => (
                                <ProductCard
                                    key={`${product.id}-${idx}`}
                                    id={product.id}
                                    slug={product.slug}
                                    categoryId={product.categoryId}
                                    title={product.name}
                                    weight={getProductWeight(product)}
                                    price={product.cost}
                                    oldPrice={product.oldCost ?? undefined}
                                    purchaseCost={product.purchaseCost}
                                    purchaseOldCost={product.purchaseOldCost}
                                    unit={product.unit}
                                    badge={getProductBadge(product, locale)}
                                    image={resolveProductImageUrl(product)}
                                    lang={locale}
                                    hasCostVariants={product.hasCostVariants}
                                    portionSize={product.portionSize}
                                />
                            ))}
                        </div>
                    );
                })}

                {currentHasMore && (
                    <div className={s.showMore}>
                        <Button
                            variant="outline-black"
                            className={s.showMoreBtn}
                            onClick={handleLoadMore}
                            disabled={currentLoading}
                        >
                            <span className={s.showMoreBtnText}>
                                {currentLoading ? "Завантаження..." : dict.showMoreButton}
                            </span>
                            {!currentLoading && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="15" viewBox="0 0 18 15" fill="none">
                                    <path d="M9.98565 1.00019L16.3141 7.32861L9.98565 13.657" stroke="black" strokeWidth="2" strokeLinecap="round"/>
                                    <line x1="15" y1="7.17139" x2="1" y2="7.17139" stroke="black" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
}
