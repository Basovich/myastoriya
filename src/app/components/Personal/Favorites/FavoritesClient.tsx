'use client';

import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { Locale } from '@/i18n/config';
import ProductCard from '@/app/components/ui/ProductCard/ProductCard';
import { Product, resolveProductImageUrl, getProductsByIdsApi } from '@/lib/graphql/queries/products';
import { useIsHydrated } from '@/hooks/useIsHydrated';
import PersonalContentBlock from '@/app/components/Personal/Shared/PersonalContentBlock';
import PersonalPageHeader from '@/app/components/Personal/Shared/PersonalPageHeader';
import { personalDict } from '@/app/components/Personal/Shared/PersonalShared';
import { useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { logoutApi } from '@/lib/graphql/queries/auth';
import { clearAuthCookies, getAccessToken } from '@/app/actions/authActions';
import { useRouter } from 'next/navigation';
import s from './Favorites.module.scss';

const favDict = {
    ua: {
        title: "СПИСОК БАЖАНЬ",
        empty: "Ви ще не додали жодного товару до обраного.",
        dotsLabel: "Улюблені товари",
        loading: "Завантаження..."
    },
    ru: {
        title: "СПИСОК ЖЕЛАНИЙ",
        empty: "Вы еще не добавили ни одного товара в избранное.",
        dotsLabel: "Любимые товары",
        loading: "Загрузка..."
    }
};

interface FavoritesClientProps {
    lang: Locale;
}

export default function FavoritesClient({ lang }: FavoritesClientProps) {
    const { items: wishlistIds, isInitialized } = useAppSelector((state) => state.wishlist);
    const hydrated = useIsHydrated();
    const dict = favDict[lang] || favDict.ua;

    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch favorites from backend whenever the active IDs change
    useEffect(() => {
        if (!hydrated || !isInitialized) return;

        let isMounted = true;
        const fetchProducts = async () => {
            try {
                if (wishlistIds.length === 0) {
                    setProducts([]);
                    return;
                }
                setIsLoading(true);
                const rawData = await getProductsByIdsApi(wishlistIds.map(Number), lang);
                if (isMounted) {
                    const productsList = rawData || [];
                    // Deduplicate products by ID
                    const uniqueProducts = Array.from(
                        new Map(productsList.map((item) => [item.id, item])).values()
                    );
                    setProducts(uniqueProducts);
                }
            } catch (error) {
                console.error('Failed to fetch favorite products:', error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        void fetchProducts();

        return () => {
            isMounted = false;
        };
    }, [wishlistIds, hydrated, isInitialized, lang]);

    const dispatch = useAppDispatch();
    const router = useRouter();
    const { user } = useAppSelector((state) => state.auth);

    const handleLogout = async () => {
        try {
            const token = await getAccessToken();
            if (token) await logoutApi(token);
        } catch {
            // Ignore
        } finally {
            await clearAuthCookies();
            dispatch(logout());
            router.replace('/');
        }
    };

    if (!hydrated) {
        return null;
    }

    return (
        <PersonalContentBlock>
            <PersonalPageHeader 
                title={dict.title}
                logoutLabel={personalDict[lang].navigation.logout}
                onLogout={handleLogout}
                user={user}
                navDict={personalDict[lang].navigation}
            />
            <div className={s.favoritesContainer}>
                {!isInitialized || isLoading ? (
                    <div className={s.emptyState}>
                        <p>{dict.loading}</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className={s.emptyState}>
                        <p>{dict.empty}</p>
                    </div>
                ) : (
                    <div className={s.productsGrid}>
                        {products.map((product) => {
                            const badgeStr = product.is_new 
                                ? "NEW" 
                                : (product.oldCost && product.oldCost > product.cost) 
                                    ? "АКЦІЯ" 
                                    : undefined;

                            return (
                                <ProductCard 
                                    key={product.id}
                                    id={product.id}
                                    slug={product.slug}
                                    title={product.name}
                                    price={product.cost}
                                    unit={product.unit}
                                    weight={product.multiplier ? String(product.multiplier) : "1"}
                                    image={resolveProductImageUrl(product)}
                                    badge={badgeStr}
                                    lang={lang} 
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </PersonalContentBlock>
    );
}
