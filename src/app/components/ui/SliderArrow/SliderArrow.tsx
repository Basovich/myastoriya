import { forwardRef } from "react";
import s from "./SliderArrow.module.scss";
import clsx from "clsx";

interface SliderArrowProps {
    direction: "left" | "right";
    className?: string;
    onClick?: () => void;
    ariaLabel?: string;
    disabled?: boolean;
}

const SliderArrow = forwardRef<HTMLButtonElement, SliderArrowProps>(({
    direction,
    className,
    onClick,
    ariaLabel,
    disabled
}, ref) => {
    return (
        <button
            ref={ref}
            className={clsx(s.navArrow, direction === "left" ? s.navLeft : s.navRight, className)}
            onClick={onClick}
            aria-label={ariaLabel || (direction === "left" ? "Попередній" : "Наступний")}
            disabled={disabled}
        >
            <svg
                width="56"
                height="56"
                viewBox="0 0 56 56"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={s.arrowIcon}
            >
                <circle cx="28" cy="28" r="28" fill="white" />
                <path
                    d="M16.2929 27.2929C15.9024 27.6834 15.9024 28.3166 16.2929 28.7071L22.6569 35.0711C23.0474 35.4616 23.6805 35.4616 24.0711 35.0711C24.4616 34.6805 24.4616 34.0474 24.0711 33.6569L18.4142 28L24.0711 22.3431C24.4616 21.9526 24.4616 21.3195 24.0711 20.9289C23.6805 20.5384 23.0474 20.5384 22.6569 20.9289L16.2929 27.2929ZM39 28V27L17 27V28V29L39 29V28Z"
                    fill="#E30613"
                />
            </svg>
        </button>
    );
});

SliderArrow.displayName = "SliderArrow";

export default SliderArrow;
