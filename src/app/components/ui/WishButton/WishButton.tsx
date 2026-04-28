"use client";

import clsx from "clsx";
import s from "./WishButton.module.scss";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleWishlistAsync } from "@/store/slices/wishlistSlice";
import { useIsHydrated } from "@/hooks/useIsHydrated";

interface WishButtonProps {
    productId: string;
    className?: string;
    ariaLabel?: string;
}

export default function WishButton({
    productId,
    className,
    ariaLabel,
}: WishButtonProps) {
    const dispatch = useAppDispatch();
    const hydrated = useIsHydrated();
    
    const isWishlisted = useAppSelector((state) =>
        state.wishlist.items.includes(productId)
    );
    
    const isActive = hydrated ? isWishlisted : false;
    
    const isLoading = useAppSelector((state) =>
        state.wishlist.loadingIds?.includes(productId) ?? false
    );

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isLoading) {
            dispatch(toggleWishlistAsync(productId));
        }
    };

    return (
        <button
            type="button"
            className={clsx(s.btn, isActive && s.active, isLoading && s.loading, className)}
            onClick={handleClick}
            aria-label={ariaLabel ?? (isActive ? "Видалити з обраного" : "Додати до обраного")}
            aria-pressed={isActive}
            disabled={isLoading}
        >
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
        </button>
    );
}
