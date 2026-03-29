'use client';

import React from 'react';
import s from './StoreMenuPage.module.scss';
import { Locale } from '@/i18n/config';
import { Dictionary } from '@/i18n/types';
import Header from '@/app/components/Header/Header';
import Footer from '@/app/components/Footer/Footer';
import HeroBanner from '@/app/components/ui/HeroBanner/HeroBanner';
import PromotionsSlider from '@/app/components/StoreMenu/PromotionsSlider/PromotionsSlider';
import CategoryCircles, { CategoryCircleItem } from '@/app/components/CategoryCircles/CategoryCircles';
import StoreMenuProductCard from '@/app/components/StoreMenu/StoreMenuProductCard/StoreMenuProductCard';
import SectionHeader from '@/app/components/ui/SectionHeader/SectionHeader';
import Breadcrumbs from '@/app/components/ui/Breadcrumbs/Breadcrumbs';
import { Store } from '@/app/components/OurStores/StoreCard/StoreCard';
import menuData from '@/content/store-menu.json';

interface StoreMenuPageProps {
    store: Store;
    lang: Locale;
    dict: Dictionary;
}

const StoreMenuPage: React.FC<StoreMenuPageProps> = ({ store, lang, dict }) => {
    const { ourStoresPage } = dict.home;
    const breadcrumbs = [
        { label: ourStoresPage.breadcrumbs.home, href: '/' },
        { label: ourStoresPage.breadcrumbs.stores, href: '/our-stores' },
        { label: store.name, href: `/our-stores/${store.id}` },
        { label: "Меню", href: '' },
    ];

    const categories: CategoryCircleItem[] = menuData.categories.map(cat => ({
        name: cat.title,
        image: cat.image,
        href: `#${cat.id}`
    }));

    return (
        <>
            <Header lang={lang} />
            <main className={s.page}>
                <div className={s.container}>
                    <Breadcrumbs items={breadcrumbs} className={s.breadcrumbs} />
                </div>
                
                <HeroBanner 
                    title={store.name}
                    image="/images/promotions/promo-hero-bg.png"
                    className={s.hero}
                />

                <div className={s.container}>
                    <PromotionsSlider 
                        promotions={menuData.promotions} 
                        title="АКЦІЯ В ЗАКЛАДІ" 
                    />

                    <CategoryCircles 
                        title="МЕНЮ РЕСТОРАНІВ" 
                        categories={categories}
                        className={s.categories}
                    />

                    <div className={s.menuSections}>
                        {menuData.categories.map((category) => {
                            const products = menuData.products.filter(p => p.categoryId === category.id);
                            if (products.length === 0) return null;

                            return (
                                <section key={category.id} id={category.id} className={s.section}>
                                    <SectionHeader 
                                        title={category.title.toUpperCase()} 
                                        withDots={true} 
                                        classNameWrapper={s.sectionHeader}
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
            <Footer lang={lang} />
        </>
    );
};

export default StoreMenuPage;
