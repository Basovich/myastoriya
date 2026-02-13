import s from "./Button.module.scss";

type ButtonVariant = "primary" | "outline" | "icon" | "pill";

interface ButtonProps {
    variant?: ButtonVariant;
    children: React.ReactNode;
    href?: string;
    onClick?: () => void;
    active?: boolean;
    className?: string;
    type?: "button" | "submit";
    ariaLabel?: string;
}

export default function Button({
    variant = "primary",
    children,
    href,
    onClick,
    active = false,
    className = "",
    type = "button",
    ariaLabel,
}: ButtonProps) {
    const classes = `${s.btn} ${s[variant]} ${active ? s.active : ""} ${className}`.trim();

    if (href) {
        return (
            <a href={href} className={classes} aria-label={ariaLabel}>
                {children}
            </a>
        );
    }

    return (
        <button type={type} className={classes} onClick={onClick} aria-label={ariaLabel}>
            {children}
        </button>
    );
}
