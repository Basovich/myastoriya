import AppLink from "../AppLink/AppLink";
import s from "./Breadcrumbs.module.scss";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav className={s.breadcrumbs}>
            {items.map((item, index) => (
                <div key={index} className={s.item}>
                    {item.href ? (
                        <AppLink href={item.href} className={s.link}>
                            {item.label}
                        </AppLink>
                    ) : (
                        <span className={s.current}>{item.label}</span>
                    )}
                    {index < items.length - 1 && (
                        <span className={s.separator}>»</span>
                    )}
                </div>
            ))}
        </nav>
    );
}
