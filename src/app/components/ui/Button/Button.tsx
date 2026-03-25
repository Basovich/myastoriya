import s from "./Button.module.scss";

type ButtonVariant = "primary" | "outline"  | "outline-black" | "icon" | "pill" | "red" | "black";

type CommonProps = {
    variant?: ButtonVariant;
    children: React.ReactNode;
    active?: boolean;
    ariaLabel?: string;
};

type AsButton = CommonProps &
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
        href?: never;
    };

type AsAnchor = CommonProps &
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & {
        href: string;
    };

type ButtonProps = AsButton | AsAnchor;

export default function Button(props: ButtonProps) {
    const {
        variant = "primary",
        children,
        active = false,
        className = "",
        ariaLabel,
        ...rest
    } = props;

    const classes = `${s.btn} ${s[variant]} ${active ? s.active : ""} ${className}`.trim();

    if (props.href) {
        const { href, ...anchorProps } = rest as Omit<AsAnchor, keyof CommonProps>;
        return (
            <a href={href} className={classes} aria-label={ariaLabel} {...anchorProps}>
                {children}
            </a>
        );
    }

    const { type = "button", disabled, onClick, ...buttonProps } = rest as Omit<AsButton, keyof CommonProps>;
    return (
        <button type={type} className={classes} onClick={onClick} aria-label={ariaLabel} disabled={disabled} {...buttonProps}>
            {children}
        </button>
    );
}
