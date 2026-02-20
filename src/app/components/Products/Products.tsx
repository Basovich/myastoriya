"use client";

import { useState, useMemo } from "react";
import s from "./Products.module.scss";
import ProductCard from "../ui/ProductCard/ProductCard";
import Button from "../ui/Button/Button";
import Image from "next/image";

interface Category {
    title: string;
    image: string;
}

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
        tabs?: string[]; // Legacy fallback
        items: ProductItem[];
        showMoreButton: string;
    };
    categories: Category[];
}

export default function Products({ dict, categories }: ProductsProps) {
    const [activeTab, setActiveTab] = useState(0);

    // Filter simulation: For different tabs, we rearrange or slice the array 
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
        <div className={s.wrapper}>
            <Image
                src="/images/products/products-bg-logo.svg"
                alt="Background logo watermark"
                width={786}
                height={1011}
                className={s.bgLogo}
            />
            <section className={s.section} id="products">
                <div className={s.tabsWrapper}>
                    <button className={`${s.tabArrow} ${s.tabArrowLeft}`} aria-label="Прокрутити вкладки вліво" onClick={() => {
                        const tabsContainer = document.querySelector(`.${s.tabs}`);
                        if (tabsContainer) tabsContainer.scrollBy({ left: -200, behavior: 'smooth' });
                    }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: "rotate(180deg)" }}>
                            <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
                        </svg>
                    </button>
                    <div className={s.tabs}>
                        {categories.map((cat, i) => (
                            <Button
                                key={i}
                                variant="pill"
                                active={activeTab === i}
                                onClick={() => setActiveTab(i)}
                            >
                                {cat.title}
                            </Button>
                        ))}
                    </div>
                    <button className={`${s.tabArrow} ${s.tabArrowRight}`} aria-label="Прокрутити вкладки вправо" onClick={() => {
                        const tabsContainer = document.querySelector(`.${s.tabs}`);
                        if (tabsContainer) tabsContainer.scrollBy({ left: 200, behavior: 'smooth' });
                    }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                <div className={s.grid}>
                    {visibleProducts.map((product) => (
                        <ProductCard
                            key={product.id}
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
                    <Button variant="pill">
                        {dict.showMoreButton}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: "8px" }}>
                            <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
                        </svg>
                    </Button>
                </div>
            </section>
        </div>
    );
}
