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
import { type Showcase, type Product, resolveProductImageUrl, getProductsApi } from "@/lib/graphql";


function roundWeightString(val: string): string {
    if (!val) return '';
    const trimmed = val.trim();
    
    // 1. Try to match a pure number (e.g. "1441.399" or "1,53")
    if (/^\d+([.,]\d+)?$/.test(trimmed)) {
        const num = parseFloat(trimmed.replace(',', '.'));
        if (!isNaN(num)) {
            if (num >= 10) {
                return String(Math.round(num));
            } else {
                return String(Math.round(num * 100) / 100);
            }
        }
    }
    
    // 2. Try to match a number with a trailing unit (e.g. "1441.399 г" or "1.5339 кг" or "0.75 л")
    const match = trimmed.match(/^(\d+([.,]\d+)?)\s*(л|l|мл|ml|г|g|кг|kg|шт)(?![а-яА-Яa-zA-Z0-9])/i);
    if (match) {
        const numPart = match[1];
        const unitPart = match[3];
        const num = parseFloat(numPart.replace(',', '.'));
        if (!isNaN(num)) {
            let roundedNumStr: string;
            if (num >= 10) {
                roundedNumStr = String(Math.round(num));
            } else {
                roundedNumStr = String(Math.round(num * 100) / 100);
            }
            const originalSpacing = trimmed.substring(numPart.length, trimmed.indexOf(unitPart));
            return `${roundedNumStr}${originalSpacing}${unitPart}`;
        }
    }
    
    return val;
}

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
    const [swiperInstance, setSwiperInstance] = useState<any>(null);

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
    }, [page, activeTab, showcases, initialProducts]);

    // Reset page when tab changes
    useEffect(() => {
        setPage(1);
    }, [activeTab]);


    const handleLoadMore = () => {
        if (!loading && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    const getWeight = (product: Product) => {
        // 1. Try to extract weight/volume from name (e.g. "0.75 л", "500 г", "330 мл")
        const nameMatch = product.name.match(/(\d+([.,]\d+)?)\s*(л|l|мл|ml|г|g|кг|kg)(?![а-яА-Яa-zA-Z0-9])/i);
        if (nameMatch) {
            return roundWeightString(nameMatch[0]);
        }

        // 2. Try specifications with a smart finder that ignores "Вага: 1" / "Вес: 1" defaults if other weight specs exist
        let weightSpec = product.specifications?.find(s => {
            const name = s.name.toLowerCase();
            const hasWeightKeyword = name.includes("вага") || name.includes("важ") || name.includes("вес") || name.includes("об'єм");
            if (!hasWeightKeyword) return false;
            const val = s.values[0] || '';
            return !(val === '1' && (name === 'вага' || name === 'вес'));
        });
        if (!weightSpec) {
            weightSpec = product.specifications?.find(s => {
                const name = s.name.toLowerCase();
                return name.includes("вага") || name.includes("важ") || name.includes("вес") || name.includes("об'єм");
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

                let formattedVal = val;
                if (specName.includes('кг') || specName.includes('kg')) {
                    formattedVal = `${val} кг`;
                } else if (specName.includes('л') || specName.includes('l')) {
                    if (!specName.includes('мл') && !specName.includes('ml')) {
                        formattedVal = `${val} л`;
                    }
                } else {
                    formattedVal = `${val} ${isLiquid ? 'мл' : 'г'}`;
                }
                return roundWeightString(formattedVal);
            }
            return roundWeightString(val);
        }

        // 3. Try portionWeight or portionSize
        if (product.portionWeight) return roundWeightString(product.portionWeight);
        if (product.portionSize) {
            const hasUnit = /[гgкmшт]/i.test(product.portionSize);
            if (hasUnit) return roundWeightString(product.portionSize);
        }

        // 3. Try multiplier with unit
        if (product.multiplier && product.multiplier > 0) {
            const normalizedUnit = product.unit?.trim().toLowerCase() || '';
            if (normalizedUnit === '100 г' || normalizedUnit === '100г') {
                return `${Math.round(product.multiplier * 1000)} г`;
            } else if (normalizedUnit === '100 мл') {
                return `${Math.round(product.multiplier * 1000)} мл`;
            }
            if (normalizedUnit === 'шт') {
                return `${product.multiplier} шт`;
            }
            return roundWeightString(`${product.multiplier} ${product.unit}`);
        }

        // 4. Default unit fallback
        if (product.unit) {
            return product.unit.toLowerCase() === 'шт' ? '1 шт' : product.unit;
        }

        return '';
    };

    const getBadge = (product: Product) => {
        if (product.is_new) return "NEW";
        if (product.oldCost && product.oldCost > product.cost) return "АКЦІЯ";
        return null;
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
                            weight={getWeight(product)}
                            price={product.cost}
                            unit={product.unit}
                            badge={getBadge(product)}
                            image={resolveProductImageUrl(product)}
                            lang={locale} 
                            hasCostVariants={product.hasCostVariants}
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
