"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import clsx from "clsx";
import s from "./Products.module.scss";
import ProductCard from "../../../components/ui/ProductCard/ProductCard";
import Button from "../../../components/ui/Button/Button";
import SliderArrow from "../../../components/ui/SliderArrow/SliderArrow";
import Image from "next/image";
import { type Showcase, type Product, resolveProductImageUrl, getProductsApi, getProductWeight, getProductBadge } from "@/lib/graphql";

interface ProductsProps {
    dict: {
        tabs?: string[];
        showMoreButton: string;
    };
    showcases: Showcase[];
    initialProducts: Product[];
    initialHasMore?: boolean;
}

export default function Products({ dict, showcases, initialProducts, initialHasMore }: ProductsProps) {
    const params = useParams();
    const locale = params?.lang as string;
    const [activeTab, setActiveTab] = useState(0);
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [loading, setLoading] = useState(false);
    const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
    const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);
    const [hasMore, setHasMore] = useState(initialHasMore ?? true);
    const [page, setPage] = useState(1);
    const [isLocked, setIsLocked] = useState(false);
    const [swiperInstance, setSwiperInstance] = useState<{ slideToLoop: (index: number) => void } | null>(null);

    useEffect(() => {
        let isMounted = true;
        
        const fetchProducts = async () => {
            const showcaseId = showcases[activeTab]?.id;
            if (!showcaseId) return;

            setLoading(true);
            try {
                const data = await getProductsApi(
                    { showcaseId: parseInt(showcaseId), limit: 8, page },
                    locale,
                );
                
                if (isMounted) {
                    if (page === 1) {
                        setProducts(data.data || []);
                    } else {
                        setProducts(prev => [...prev, ...(data.data || [])]);
                    }
                    setHasMore(data.has_more_pages);
                }
            } catch (error) {
                if (isMounted) {
                    console.error("Failed to fetch products:", error);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        // Don't fetch on first mount if it's the first tab AND page is 1
        if (activeTab === 0 && page === 1) {
            setProducts(initialProducts);
            // We assume showcases[0] might have more pages, or we could fetch it too.
            // For simplicity, we just use initialProducts.
        } else {
            fetchProducts();
        }

        return () => {
            isMounted = false;
        };
    }, [page, activeTab, showcases, initialProducts, locale]);

    // Reset page when tab changes
    useEffect(() => {
        setPage(1);
    }, [activeTab]);


    const handleLoadMore = () => {
        if (!loading && hasMore) {
            setPage(prev => prev + 1);
        }
    };


    if (!dict || !showcases || showcases.length === 0) return null;

    const sliderShowcases = showcases.length > 0
        ? Array(5).fill(showcases).flat()
        : [];

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
                        onSwiper={setSwiperInstance}
                        modules={[Navigation]}
                        navigation={{ prevEl, nextEl }}
                        loop={true}
                        loopAdditionalSlides={showcases.length}
                        loopAddBlankSlides={true}
                        centeredSlides={true}
                        grabCursor={true}
                        simulateTouch={true}
                        allowTouchMove={true}
                        slidesPerView="auto"
                        spaceBetween={8}
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
                                <SwiperSlide key={`${showcase.id}-${i}`} className={s.tabSlide}>
                                    <Button
                                        variant="pill"
                                        active={activeTab === realIndex}
                                        onClick={() => {
                                            setActiveTab(realIndex);
                                            if (swiperInstance) {
                                                swiperInstance.slideToLoop(realIndex);
                                            }
                                        }}
                                        className={s.tabButton}
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

                <div className={clsx(s.grid, loading && s.loading)}>
                    {products.map((product, idx) => (
                        <ProductCard
                            key={`${product.id}-${idx}`}
                            id={product.id}
                            slug={product.slug}
                            title={product.name}
                            weight={getProductWeight(product)}
                            price={product.cost}
                            oldPrice={product.oldCost ?? undefined}
                            unit={product.unit}
                            badge={getProductBadge(product, locale)}
                            image={resolveProductImageUrl(product)}
                            lang={locale} 
                            hasCostVariants={product.hasCostVariants}
                            portionSize={product.portionSize}
                        />
                    ))}
                </div>

                {hasMore && (
                    <div className={s.showMore}>
                        <Button 
                            variant="outline-black" 
                            className={s.showMoreBtn}
                            onClick={handleLoadMore}
                            disabled={loading}
                        >
                            <span className={s.showMoreBtnText}>
                                {loading ? "Завантаження..." : dict.showMoreButton}
                            </span>
                            {!loading && (
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
