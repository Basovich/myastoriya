import s from "./Button.module.scss";

type ButtonVariant = "primary" | "outline"  | "outline-black" | "icon" | "pill" | "red" | "black";

interface ButtonProps {
    variant?: ButtonVariant;
    children: React.ReactNode;
    href?: string;
    onClick?: () => void;
    active?: boolean;
    className?: string;
    type?: "button" | "submit";
    ariaLabel?: string;
    disabled?: boolean;
    [key: string]: any;
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
    disabled,
    ...props
}: ButtonProps) {
    const classes = `${s.btn} ${s[variant]} ${active ? s.active : ""} ${className}`.trim();

    if (href) {
        return (
            <a href={href} className={classes} aria-label={ariaLabel} {...(disabled && { disabled: true})} {...props}>
                {children}
            </a>
        );
    }

    return (
        <button type={type} className={classes} onClick={onClick} aria-label={ariaLabel} {...(disabled && { disabled: true})} {...props}>
            {children}
        </button>
    );
}
