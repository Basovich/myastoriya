'use client';

import React from 'react';
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
import { RestaurantMenuCategory } from '@/lib/graphql/queries/pages/restaurantMenu';
import clsx from "clsx";

interface StoreMenuPageProps {
    shop: Shop;
    lang: Locale;
    dict: Dictionary;
    initialMenu?: RestaurantMenuCategory[];
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

const isDrinksOrWines = (name: string): boolean => {
    const n = name.toLowerCase();
    return n.includes('вино') || n.includes('вина') || n.includes('wine') || 
           n.includes('напої') || n.includes('напитки') || n.includes('кава') || 
           n.includes('чай') || n.includes('drinks') || n.includes('алко');
};

const StoreMenuPage: React.FC<StoreMenuPageProps> = ({ shop, lang, dict, initialMenu = [] }) => {
    // Resolve menu data (use API dynamic menu if available, otherwise map mock data to API structure)
    const resolvedMenu: RestaurantMenuCategory[] = (initialMenu && initialMenu.length > 0)
        ? initialMenu
        : menuData.categories.map(cat => ({
            id: cat.id,
            name: cat.title,
            products: menuData.products.filter(p => p.categoryId === cat.id).map(p => ({
                id: String(p.id),
                name: p.title,
                slug: '',
                cost: p.price,
                oldCost: p.price,
                available: 1,
                portionSize: p.weight,
                isSpicy: false,
                text: null,
                specifications: null,
                dishSpecifics: [],
                image: p.image ? {
                    url: { grid2x: p.image, main2x: p.image },
                    alt: p.title,
                    title: p.title
                } : null,
                images: null,
                modifierGroups: []
            }))
        }));
    // Filter categories to only show food in the standard list
    const foodCategories = resolvedMenu.filter(cat => !isDrinksOrWines(cat.name));

    const categories: CategoryCircleItem[] = foodCategories.map(cat => ({
        name: cat.name,
        image: getCategoryImage(cat.name),
        href: `#${cat.id}`
    }));

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
                        />
                    </div>
                </section>

                <div className={s.container}>
                    <div className={s.menuSections}>
                        {foodCategories.map((category) => {
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
                <StoreMenuTabular initialMenu={resolvedMenu} />
            </main>
        </>
    );
};

export default StoreMenuPage;
