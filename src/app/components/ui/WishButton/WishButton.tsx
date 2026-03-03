"use client";

import clsx from "clsx";
import s from "./WishButton.module.scss";

interface WishButtonProps {
    active?: boolean;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    className?: string;
    ariaLabel?: string;
}

export default function WishButton({
    active = false,
    onClick,
    className,
    ariaLabel = "Додати до обраного",
}: WishButtonProps) {
    return (
        <button
            type="button"
            className={clsx(s.btn, active && s.active, className)}
            onClick={onClick}
            aria-label={ariaLabel}
            aria-pressed={active}
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
