'use client';

import { useState } from 'react';
import { useIsHydrated } from '@/hooks/useIsHydrated';
import { useRouter, useParams, usePathname } from 'next/navigation';
import Image from 'next/image';
import s from './Actions.module.scss';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setCartModalOpen } from '@/store/slices/cartSlice';
import AuthButton from '@/app/components/Header/Shared/AuthButton';
import AuthModal from '@/app/components/AuthModal';
import CartModal from '@/app/components/CartModal/CartModal';

import { getLocalizedHref } from '@/utils/i18n-helpers';
import { Locale } from '@/i18n/config';

function Actions() {
    const dispatch = useAppDispatch();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const isCartModalOpen = useAppSelector((state) => state.cart.isCartModalOpen);
    const setIsCartModalOpen = (open: boolean) => dispatch(setCartModalOpen(open));
    const router = useRouter();
    const params = useParams();
    const pathname = usePathname();
    const lang = (params?.lang as Locale) || 'ua';
    const isCheckoutPage = pathname?.includes('/checkout');

    const cartItems = useAppSelector((state) => state.cart.items);
    const wishlistItems = useAppSelector((state) => state.wishlist.items);
    const { isAuthenticated, isGuest } = useAppSelector((state) => state.auth);
    const isReallyLoggedIn = isAuthenticated && !isGuest;

    const totalCartItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalWishlistItems = wishlistItems.length;
    const hydrated = useIsHydrated();

    const handleFavoritesClick = () => {
        if (isReallyLoggedIn) {
            router.push(getLocalizedHref('/personal/favorites/', lang));
        } else {
            setIsAuthModalOpen(true);
        }
    };

    return (
        <>
            <div className={s.actions}>
                {/* Cart */}
                <button className={s.actionBtn} aria-label={lang === 'ru' ? 'Корзина' : 'Кошик'} onClick={() => setIsCartModalOpen(true)}>
                    <Image src="/icons/shopping-bag.svg" alt="Cart" width={20} height={20} />
                    {hydrated && totalCartItems > 0 && (
                        <span className={s.badge}>{totalCartItems}</span>
                    )}
                </button>

                {/* Heart (Favorites) */}
                <button
                    className={s.actionBtn}
                    aria-label={lang === 'ru' ? 'Избранное' : 'Обране'}
                    onClick={handleFavoritesClick}
                >
                    <Image src="/icons/icon-heart.svg" alt="Favorites" width={20} height={20} />
                    {hydrated && totalWishlistItems > 0 && (
                        <span className={s.badge}>{totalWishlistItems}</span>
                    )}
                </button>

                {/* Auth Button (Login / Profile) */}
                <AuthButton />
            </div>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={() => {
                    router.push(getLocalizedHref('/personal/favorites/', lang));
                }}
            />
            <CartModal
                isOpen={isCartModalOpen}
                onClose={() => setIsCartModalOpen(false)}
                isCheckoutMode={isCheckoutPage}
            />
        </>
    );
}

export default Actions;
