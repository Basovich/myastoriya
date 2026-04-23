'use client';

import React from 'react';
import s from './StoreMenuPage.module.scss';
import { Locale } from '@/i18n/config';
import { Dictionary } from '@/i18n/types';
import HeroBanner from '@/app/components/ui/HeroBanner/HeroBanner';
import PromotionsSlider from '@/app/components/StoreMenu/PromotionsSlider/PromotionsSlider';
import CategoryCircles, { CategoryCircleItem } from '@/app/components/CategoryCircles/CategoryCircles';
import StoreMenuProductCard from '@/app/components/StoreMenu/StoreMenuProductCard/StoreMenuProductCard';
import SectionHeader from '@/app/components/ui/SectionHeader/SectionHeader';
import StoreMenuHero from '@/app/components/StoreMenu/StoreMenuHero/StoreMenuHero';
import { Shop } from '@/lib/graphql/queries/shops';
import menuData from '@/content/store-menu.json';

interface StoreMenuPageProps {
    shop: Shop;
    lang: Locale;
    dict: Dictionary;
}

const StoreMenuPage: React.FC<StoreMenuPageProps> = ({ shop, lang, dict }) => {
    const categories: CategoryCircleItem[] = menuData.categories.map(cat => ({
        name: cat.title,
        image: cat.image,
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

                <section className={s.whiteSection}>
                    <CategoryCircles
                        title="МЕНЮ М'ЯСТОРІЯ"
                        categories={categories}
                        className={s.categories}
                        withDots={true}
                    />
                </section>

                <div className={s.container}>
                    <div className={s.menuSections}>
                        {menuData.categories.map((category) => {
                            const products = menuData.products.filter(p => p.categoryId === category.id);
                            if (products.length === 0) return null;

                            return (
                                <section key={category.id} id={category.id} className={s.sectionSpacing}>
                                    <SectionHeader 
                                        title={category.title.toUpperCase()} 
                                        withDots={true} 
                                    />
                                    <div className={s.grid}>
                                        {products.map((product) => (
                                            <StoreMenuProductCard 
                                                key={product.id}
                                                {...product}
                                            />
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                </div>
            </main>
        </>
    );
};

export default StoreMenuPage;
