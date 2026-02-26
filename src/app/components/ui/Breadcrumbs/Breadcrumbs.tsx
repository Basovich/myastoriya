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
                        <span className={s.separator}>
                            <svg width="10" height="9" viewBox="0 0 10 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4.89501 1.00001L7.99998 4.10498L4.89501 7.20995" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <line x1="6.85059" y1="4.53906" x2="1.00036" y2="4.53906" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </span>
                    )}
                </div>
            ))}
        </nav>
    );
}
