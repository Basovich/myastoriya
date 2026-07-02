'use client';

import React, { useState, useEffect } from 'react';
import s from './StoreMenuPage.module.scss';
import { Locale } from '@/i18n/config';
import { Dictionary } from '@/i18n/types';
import CategoryCircles, { CategoryCircleItem } from '@/app/components/CategoryCircles/CategoryCircles';
import StoreMenuProductCard from '@/app/components/StoreMenu/StoreMenuProductCard/StoreMenuProductCard';
import SectionHeader from '@/app/components/ui/SectionHeader/SectionHeader';
import StoreMenuHero from '@/app/components/StoreMenu/StoreMenuHero/StoreMenuHero';
import PromotionsSlider from '@/app/components/StoreMenu/PromotionsSlider/PromotionsSlider';
import StoreMenuTabular from '@/app/components/StoreMenu/StoreMenuTabular/StoreMenuTabular';
import { Shop } from '@/lib/graphql/queries/shops';
import { menuData } from '@/app/pages/StoreMenu/store-menu.content';
import { RestaurantMenuCategory, ShopCustomMenuCategory } from '@/lib/graphql/queries/pages/restaurantMenu';
import clsx from "clsx";

interface StoreMenuPageProps {
    shop: Shop;
    lang: Locale;
    dict: Dictionary;
    initialMenu?: RestaurantMenuCategory[];
    initialCustomMenu?: ShopCustomMenuCategory[];
}

const getCategoryImage = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes("бургер")) return "/images/cat-burgers.png";
    if (lower.includes("набор") || lower.includes("сет")) return "/images/cat-sets.png";
    if (lower.includes("гриль") || lower.includes("м'яс") || lower.includes("стейк")) return "/images/cat-grill.png";
    if (lower.includes("напівфаб")) return "/images/cat-branded.png";
    if (lower.includes("ковбас") || lower.includes("сосис")) return "/images/cat-branded.png";
    if (lower.includes("сир")) return "/images/cat-shashlik.png";
    return "/images/cat-restaurant.png";
};

const StoreMenuPage: React.FC<StoreMenuPageProps> = ({ shop, lang, dict, initialMenu = [], initialCustomMenu = [] }) => {
    // Filter out products that are not available (available === 0)
    const resolvedMenu = initialMenu
        .map(cat => ({
            ...cat,
            products: cat.products.filter(p => p.available > 0)
        }))
        .filter(cat => cat.products.length > 0);
    // All categories from restaurantMenu are treated as food/standard grid categories now
    const foodCategories = resolvedMenu;

    const categories: CategoryCircleItem[] = foodCategories.map(cat => ({
        name: cat.name,
        image: getCategoryImage(cat.name),
        href: `#${cat.id}`
    }));

    const [visibleCategoriesCount, setVisibleCategoriesCount] = useState(2);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // Фоновий рендеринг решти категорій після монтування
        const timer = setTimeout(() => {
            setVisibleCategoriesCount(foodCategories.length);
        }, 300);
        return () => clearTimeout(timer);
    }, [foodCategories.length]);

    const handleCategoryHashClick = (targetId: string) => {
        setVisibleCategoriesCount(foodCategories.length);
        setTimeout(() => {
            const element = document.getElementById(targetId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 50);
    };

    const displayedCategories = isClient 
        ? foodCategories.slice(0, visibleCategoriesCount) 
        : foodCategories.slice(0, 2);

    return (
        <>
            <main className={s.page}>
                <StoreMenuHero lang={lang} />
                
                <section className={s.whiteSection}>
                    <div className={s.container}>
                        <PromotionsSlider 
                            promotions={menuData.promotions} 
                            title="АКЦІЯ В ЗАКЛАДІ"
                        />
                    </div>
                </section>

                <section className={clsx(s.whiteSection, s.pt)}>
                    <div className={s.container}>
                        <CategoryCircles
                            title="МЕНЮ М'ЯСТОРІЯ"
                            categories={categories}
                            className={s.categories}
                            withDots={true}
                            onHashClick={handleCategoryHashClick}
                        />
                    </div>
                </section>

                <div className={s.container}>
                    <div className={s.menuSections}>
                        {displayedCategories.map((category) => {
                            if (category.products.length === 0) return null;

                            return (
                                <section key={category.id} id={category.id} className={s.sectionSpacing}>
                                    <SectionHeader 
                                        title={category.name.toUpperCase()} 
                                        withDots={true} 
                                    />
                                    <div className={s.grid}>
                                        {category.products.map((product) => (
                                            <StoreMenuProductCard 
                                                key={product.id}
                                                product={product}
                                            />
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                </div>

                {/* Tabular menu section for wines and drinks */}
                {isClient && visibleCategoriesCount === foodCategories.length && (
                    <StoreMenuTabular customMenu={initialCustomMenu} />
                )}
            </main>
        </>
    );
};

export default StoreMenuPage;
