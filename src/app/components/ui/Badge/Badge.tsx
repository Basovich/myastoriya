import clsx from "clsx";
import s from "./Badge.module.scss";

type BadgeVariant = "new" | "sale" | "hot";

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    className?: string;
}

export default function Badge({
    children,
    variant = "new",
    className,
}: BadgeProps) {
    return (
        <span className={clsx(s.badge, s[variant], className)}>
            {children}
        </span>
    );
}
