'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import s from './Actions.module.scss';
import { useAppSelector } from '@/store/hooks';
import AuthButton from '@/app/components/Header/Shared/AuthButton';
import AuthModal from '@/app/components/AuthModal';
import CartModal from '@/app/components/CartModal/CartModal';

export default function Actions() {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);
    const router = useRouter();
    const params = useParams();
    const lang = params?.lang as string || 'ua';

    const cartItems = useAppSelector((state) => state.cart.items);
    const wishlistItems = useAppSelector((state) => state.wishlist.items);
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    const totalCartItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalWishlistItems = wishlistItems.length;

    const handleFavoritesClick = () => {
        if (isAuthenticated) {
            router.push(`/${lang}/personal/favorites/`);
        } else {
            setIsAuthModalOpen(true);
        }
    };

    return (
        <>
            <div className={s.actions}>
                {/* Cart */}
                <button className={s.actionBtn} aria-label="Кошик" onClick={() => setIsCartModalOpen(true)}>
                    <Image src="/icons/shopping-bag.svg" alt="Cart" width="20" height="20" />
                    {totalCartItems > 0 && (
                        <span className={s.badge}>{totalCartItems}</span>
                    )}
                </button>

                {/* Heart (Favorites) */}
                <button
                    className={s.actionBtn}
                    aria-label="Обране"
                    onClick={handleFavoritesClick}
                >
                    <Image src="/icons/icon-heart.svg" alt="Favorites" width="20" height="20" />
                    {totalWishlistItems > 0 && (
                        <span className={s.badge}>{totalWishlistItems}</span>
                    )}
                </button>

                {/* Auth Button (Login / Profile) */}
                <AuthButton />
            </div>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={() => router.push(`/${lang}/personal/favorites/`)}
            />
            <CartModal
                isOpen={isCartModalOpen}
                onClose={() => setIsCartModalOpen(false)}
            />
        </>
    );
}
