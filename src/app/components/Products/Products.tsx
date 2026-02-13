"use client";

import { useState } from "react";
import s from "./Products.module.scss";
import homeData from "@/content/pages/home.json";
import ProductCard from "../ui/ProductCard/ProductCard";
import Button from "../ui/Button/Button";

export default function Products() {
    const { products } = homeData;
    const [activeTab, setActiveTab] = useState(0);

    return (
        <section className={s.section} id="products">
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
                    </svg>
                </Button>
            </div>
        </section>
    );
}
