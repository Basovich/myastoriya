'use client';

import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { useParams } from 'next/navigation';
import { Locale } from '@/i18n/config';
import SectionHeader from '@/app/components/ui/SectionHeader/SectionHeader';
import ProductCard from '@/app/components/ui/ProductCard/ProductCard';
import uaData from '@/content/ua.json';
import ruData from '@/content/ru.json';
import s from './Favorites.module.scss';

const favDict = {
    ua: {
        title: "СПИСОК БАЖАНЬ",
        empty: "Ви ще не додали жодного товару до обраного.",
        dotsLabel: "Улюблені товари"
    },
    ru: {
        title: "СПИСОК ЖЕЛАНИЙ",
        empty: "Вы еще не добавили ни одного товара в избранное.",
        dotsLabel: "Любимые товары"
    }
};

export default function FavoritesPage() {
    const { items: wishlistIds } = useAppSelector((state) => state.wishlist);
    const params = useParams();
    const lang = (params?.lang as Locale) || 'ua';
    const dict = favDict[lang as keyof typeof favDict];
    const mainDict = lang === 'ua' ? uaData : ruData;
    
    // In a real app, we'd fetch these by IDs from the API. 
    // Here we filter from the main catalog data for consistency.
    const allProducts = mainDict.home.products.items;
    const wishlistProducts = allProducts.filter(p => wishlistIds.includes(String(p.id)));

    return (
        <div className={s.favoritesContainer}>
            <div className={s.unifiedBlock}>
                <div className={s.blockHeader}>
                    <div className={s.titleGroup}>
                        <SectionHeader 
                            title={dict.title} 
                            withDots={false} 
                            classNameTitle={s.pageTitle}
                        />
                        <div className={s.brandDots}>
                            <span />
                            <span />
                            <span />
                        </div>
                    </div>
                </div>

                {wishlistProducts.length === 0 ? (
                    <div className={s.emptyState}>
                        <p>{dict.empty}</p>
                    </div>
                ) : (
                    <div className={s.productsGrid}>
                        {wishlistProducts.map((product: any) => (
                            <ProductCard 
                                key={product.id}
                                id={product.id}
                                title={product.title}
                                price={product.price}
                                unit={product.unit}
                                weight={product.weight}
                                image={product.image}
                                badge={product.badge}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
