import clsx from "clsx";
import AppLink from "../AppLink/AppLink";
import s from "./Breadcrumbs.module.scss";
import Image from "next/image";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

export default function Breadcrumbs({ items, className }: BreadcrumbsProps) {
    return (
        <nav className={clsx(s.breadcrumbs, className)}>
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
                        <Image className={s.separator}
                               src="/icons/breadcrumbs_arrow.svg"
                               alt="Arrow"
                               width="10"
                               height="9"
                        />
                    )}
                </div>
            ))}
        </nav>
    );
}
