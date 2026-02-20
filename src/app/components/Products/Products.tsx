"use client";

import { useState } from "react";
import s from "./Products.module.scss";
import homeData from "@/content/pages/home.json";
import ProductCard from "../ui/ProductCard/ProductCard";
import Button from "../ui/Button/Button";
import Image from "next/image";

export default function Products() {
    const { products } = homeData;
    const [activeTab, setActiveTab] = useState(0);

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
                    <div className={s.tabs}>
                        {products.tabs.map((tab, i) => (
                            <Button
                                key={i}
                                variant="pill"
                                active={activeTab === i}
                                onClick={() => setActiveTab(i)}
                            >
                                {tab}
                            </Button>
                        ))}
                    </div>
                    <button className={s.tabArrow} aria-label="Прокрутити вкладки">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                <div className={s.grid}>
                    {products.items.map((product) => (
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
                    <Button variant="outline">
                        {products.showMoreButton}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: "8px" }}>
                            <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
                        </svg>
                    </Button>
                </div>
            </section>
        </div>
    );
}
