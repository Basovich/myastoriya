import React from "react";

type IconName = "favorite" | "cart" | "arrow-right" | "chevron-right" | "plus";

interface IconProps {
    name: IconName;
    className?: string;
    width?: number | string;
    height?: number | string;
    strokeWidth?: number | string;
}

const icons: Record<IconName, (props: any) => React.ReactNode> = {
    favorite: (props) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
    ),
    cart: (props) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2}>
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
    ),
    plus: (props) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2.5}>
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    ),
    "arrow-right": (props) => (
        <svg {...props} viewBox="0 0 18 15" fill="none">
            <path d="M9.98467 1.00019L16.3131 7.32861L9.98467 13.657" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" />
            <line x1="15" y1="7.17139" x2="1" y2="7.17139" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" />
        </svg>
    ),
    "chevron-right": (props) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
    ),
};

export default function Icon({
    name,
    className,
    width = 18,
    height = 18,
    strokeWidth,
}: IconProps) {
    const IconComponent = icons[name];
    if (!IconComponent) return null;

    return <IconComponent className={className} width={width} height={height} strokeWidth={strokeWidth} />;
}
