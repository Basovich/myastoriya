"use client";

import { useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import s from "./AddToCartButton.module.scss";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart } from "@/store/slices/cartSlice";
import CartModal from "@/app/components/CartModal/CartModal";

interface AddToCartButtonProps {
    productId: string | number;
    className?: string;
}

export default function AddToCartButton({ productId, className }: AddToCartButtonProps) {
    const dispatch = useAppDispatch();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isInCart = useAppSelector((state) =>
        state.cart.items.some((item) => item.id === String(productId))
    );

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isInCart) {
            dispatch(addToCart({ id: String(productId), quantity: 1 }));
        }

        setIsModalOpen(true);
    };

    return (
        <>
            <button
                type="button"
                className={clsx(s.btn, isInCart && s.active, className)}
                onClick={handleClick}
                aria-label={isInCart ? "Товар у кошику" : "Додати до кошика"}
                aria-pressed={isInCart}
            >
                <Image src="/icons/icon-plus.svg" width={12} height={12} alt="" aria-hidden="true" />
            </button>

            <CartModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
}
