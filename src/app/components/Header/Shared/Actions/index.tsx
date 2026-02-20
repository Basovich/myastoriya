import s from "./Actions.module.scss";
import Image from "next/image";
import { useAppSelector } from "@/store/hooks";

interface ActionsProps {
    showLogin?: boolean;
}

export default function Actions({ showLogin = false }: ActionsProps) {
    const cartItems = useAppSelector((state) => state.cart.items);
    const wishlistItems = useAppSelector((state) => state.wishlist.items);

    const totalCartItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalWishlistItems = wishlistItems.length;

    return (
        <div className={s.actions}>
            {/* Cart */}
            <button className={s.actionBtn} aria-label="Кошик">
                <Image src="/icons/shopping-bag.png" alt="Cart" width="20" height="20" />
                {totalCartItems > 0 && (
                    <span className={s.badge}>{totalCartItems}</span>
                )}
            </button>

            {/* Heart (Favorites) */}
            <button className={s.actionBtn} aria-label="Обране">
                <Image src="/icons/icon-heart.svg" alt="Favorites" width="20" height="20" />
                {totalWishlistItems > 0 && (
                    <span className={s.badge}>{totalWishlistItems}</span>
                )}
            </button>

            {/* DESKTOP: Login link */}
            {showLogin && (
                <a href="#" className={s.loginLink}>
                    Вхід
                    <Image src="/icons/icon-profile.svg" alt="Profile" width="20" height="20" className={s.loginIcon} />
                </a>
            )}
        </div>
    );
}
