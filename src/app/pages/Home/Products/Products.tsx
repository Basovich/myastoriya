"use client";

import { useState, useMemo } from "react";
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
import type { PopularCategory } from "@/lib/graphql";



interface ProductItem {
    id: number;
    title: string;
    weight: string;
    price: number;
    unit: string;
    badge: string | null;
    image: string;
}

interface ProductsProps {
    dict: {
        tabs?: string[];
        items: ProductItem[];
        showMoreButton: string;
    };
    categories: PopularCategory[];
}

export default function Products({ dict, categories }: ProductsProps) {
    const [activeTab, setActiveTab] = useState(0);
    const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
    const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);

    // Catalog simulation: For different tabs, we rearrange or slice the array
    // to give the visual impression of server-side or actual category filtering
    const visibleProducts = useMemo(() => {
        if (!dict?.items) return [];
        // If "Рекомендуємо" or tab 0, show all 8 (or standard view)
        if (activeTab === 0) return dict.items;

        // Simulated algorithm: Pick items based on tab index modulo to create distinct, pseudo-random sets
        return dict.items.filter((_, index) => (index + activeTab) % 2 === 0 || (index + activeTab) % 3 === 0).slice(0, 4 + (activeTab % 3));
    }, [dict, activeTab]);

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

                <div className={s.grid}>
                    {visibleProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            id={product.id}
                            title={product.title}
                            weight={product.weight}
                            price={product.price}
                            unit={product.unit}
                            badge={product.badge}
                            image={product.image}
                        />
                    ))}
                </div>

                <div className={s.showMore}>
                    <Button variant="outline-black" className={s.showMoreBtn}>
                        <span className={s.showMoreBtnText}>{dict.showMoreButton}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="15" viewBox="0 0 18 15" fill="none">
                            <path d="M9.98565 1.00019L16.3141 7.32861L9.98565 13.657" stroke="black" strokeWidth="2" strokeLinecap="round"/>
                            <line x1="15" y1="7.17139" x2="1" y2="7.17139" stroke="black" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </Button>
                </div>
            </div>
        </section>
    );
}
