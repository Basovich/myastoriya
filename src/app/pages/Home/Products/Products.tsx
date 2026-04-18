"use client";

import { useState, useMemo, useEffect } from "react";
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
import { type PopularCategory, type Product } from "@/lib/graphql";

interface ProductsProps {
    dict: {
        tabs?: string[];
        items: any[]; // Mock items no longer used
        showMoreButton: string;
    };
    categories: PopularCategory[];
    initialProducts: Product[];
}

export default function Products({ dict, categories, initialProducts }: ProductsProps) {
    const params = useParams();
    const locale = params?.lang as string;
    const [activeTab, setActiveTab] = useState(0);
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [loading, setLoading] = useState(false);
    const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
    const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        let isMounted = true;
        
        const fetchProducts = async () => {
            const categoryId = categories[activeTab]?.id;
            if (!categoryId) return;

            setLoading(true);
            try {
                const response = await fetch('/api/products', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Content-Language': locale === 'ru' ? 'ru_RU' : 'uk_UA'
                    },
                    body: JSON.stringify({ 
                        categoryId: parseInt(categoryId), 
                        limit: 8,
                        page: page
                    })
                });
                
                if (!response.ok) throw new Error("Failed to fetch products through proxy");
                
                const data = await response.json();
                
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
            // We assume categories[0] might have more pages, or we could fetch it too.
            // For simplicity, we just use initialProducts.
        } else {
            fetchProducts();
        }

        return () => {
            isMounted = false;
        };
    }, [page, activeTab, categories, initialProducts]);

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
        const weightSpec = product.specifications?.find(s => 
            s.name.toLowerCase().includes("вага") || 
            s.name.toLowerCase().includes("об'єм")
        );
        if (weightSpec && weightSpec.values.length > 0) {
            return weightSpec.values[0];
        }
        return product.multiplier ? `${product.multiplier}` : "";
    };

    const getBadge = (product: Product) => {
        if (product.is_new) return "NEW";
        if (product.oldCost && product.oldCost > product.cost) return "АКЦІЯ";
        return null;
    };

    const getImageUrl = (product: Product) => {
        const url = product.image?.url.grid2x || 
                   product.image?.url.main2x || 
                   product.image?.url.grid1x || 
                   product.image?.url.main1x || 
                   product.image?.url.big;
                   
        if (!url) return "/images/placeholder.png";
        if (url.startsWith("/")) {
            return `https://dev-api.myastoriya.com.ua${url}`;
        }
        return url;
    };

    if (!dict || !categories) return null;

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
                <div className={s.tabsWrapper}>
                    <SliderArrow
                        direction="left"
                        className={clsx(s.tabArrow, s.left)}
                        onClick={() => { }}
                        ariaLabel="Прокрутити вкладки вліво"
                        ref={setPrevEl}
                    />
                    <Swiper
                        modules={[Navigation]}
                        navigation={{ prevEl, nextEl }}
                        loop={true}
                        slidesPerView="auto"
                        spaceBetween={8}
                        className={clsx(s.tabs, "products-tabs-swiper")}
                    >
                        {categories.map((cat, i) => (
                            <SwiperSlide key={cat.id} className={s.tabSlide}>
                                <Button
                                    variant="pill"
                                    active={activeTab === i}
                                    onClick={() => setActiveTab(i)}
                                    className={s.tabButton}
                                >
                                    {cat.name}
                                </Button>
                            </SwiperSlide>
                        ))}
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
                            title={product.name}
                            weight={getWeight(product)}
                            price={product.cost}
                            unit={product.unit}
                            badge={getBadge(product)}
                            image={getImageUrl(product)}
                        lang="ua" />
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
