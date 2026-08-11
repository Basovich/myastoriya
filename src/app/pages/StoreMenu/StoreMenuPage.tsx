'use client';

import React, { useState, useEffect } from 'react';
import s from './StoreMenuPage.module.scss';
import { useIsHydrated } from '@/hooks/useIsHydrated';
import { Locale } from '@/i18n/config';
import { Dictionary } from '@/i18n/types';
import CategoryCircles, { CategoryCircleItem } from '@/app/components/CategoryCircles/CategoryCircles';
import StoreMenuProductCard from '@/app/components/StoreMenu/StoreMenuProductCard/StoreMenuProductCard';
import SectionHeader from '@/app/components/ui/SectionHeader/SectionHeader';
import StoreMenuHero from '@/app/components/StoreMenu/StoreMenuHero/StoreMenuHero';
import PromotionsSlider from '@/app/components/StoreMenu/PromotionsSlider/PromotionsSlider';
import StoreMenuTabular from '@/app/components/StoreMenu/StoreMenuTabular/StoreMenuTabular';
import { Shop } from '@/lib/graphql/queries/shops';
import { RestaurantMenuCategory, ShopCustomMenuCategory } from '@/lib/graphql/queries/pages/restaurantMenu';
import clsx from "clsx";

interface StoreMenuPageProps {
    shop: Shop;
    lang: Locale | string;
    dict: Dictionary;
    initialMenu?: RestaurantMenuCategory[];
    initialCustomMenu?: ShopCustomMenuCategory[];
}

const getCategoryImage = (cat: RestaurantMenuCategory): string => {
    const name = cat.name || '';
    const lower = name.toLowerCase();
    if (lower.includes("бургер")) return "/images/cat-burgers.png";
    if (lower.includes("набор") || lower.includes("сет")) return "/images/cat-sets.png";
    if (lower.includes("гриль") || lower.includes("м'яс") || lower.includes("стейк") || lower.includes("шашлик")) return "/images/cat-grill.png";
    if (lower.includes("напівфаб") || lower.includes("ковбас") || lower.includes("сосис")) return "/images/cat-branded.png";
    if (lower.includes("піц")) return "/images/cat-shashlik.png";
    if (lower.includes("гарнір")) return "/images/cat-sets.png";
    if (lower.includes("десерт")) return "/images/cat-sets.png";
    if (lower.includes("напої") || lower.includes("напиток") || lower.includes("бар")) return "/images/cat-branded.png";

    // Fallback: use first available product's image if present
    const firstProductImg = cat.products?.find(p => p.images && p.images.length > 0)?.images?.[0]?.url?.main2x;
    if (firstProductImg) {
        return firstProductImg.startsWith('/') ? `https://dev-api.myastoriya.com.ua${firstProductImg}` : firstProductImg;
    }

    return "/images/cat-restaurant.png";
};

const StoreMenuPage: React.FC<StoreMenuPageProps> = ({ shop, lang, initialMenu = [], initialCustomMenu = [] }) => {
    // Filter out products that are not available (available === 0)
    const foodCategories = initialMenu
        .map(cat => ({
            ...cat,
            products: cat.products.filter(p => p.available > 0)
        }))
        .filter(cat => cat.products.length > 0);

    const displayedPromotions = (shop?.banners || []).map((banner, idx) => ({
        id: idx,
        title: banner.title || undefined,
        alt: banner.alt || undefined,
        image: banner.url.size2x || banner.url.size1x || banner.url.size3x || '/images/store/menu_promo.png',
    }));

    const categories: CategoryCircleItem[] = foodCategories.map(cat => ({
        name: cat.name,
        image: getCategoryImage(cat),
        href: `#${cat.id}`
    }));

    const [visibleCategoriesCount, setVisibleCategoriesCount] = useState(2);
    const isClient = useIsHydrated();

    useEffect(() => {
        if (foodCategories.length <= 2) return;
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
                
                {displayedPromotions.length > 0 && (
                    <section className={s.whiteSection}>
                        <div className={s.container}>
                            <PromotionsSlider 
                                promotions={displayedPromotions} 
                                title="АКЦІЯ В ЗАКЛАДІ"
                            />
                        </div>
                    </section>
                )}

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
