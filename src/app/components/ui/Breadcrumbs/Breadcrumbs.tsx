"use client";

import clsx from "clsx";
import { usePathname, useParams } from "next/navigation";
import Image from "next/image";
import AppLink from "../AppLink/AppLink";
import s from "./Breadcrumbs.module.scss";
import { generateBreadcrumbJsonLd } from "@/utils/seo";

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

export interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
    canonicalUrl?: string;
}

export default function Breadcrumbs({ items, className, canonicalUrl }: BreadcrumbsProps) {
    const pathname = usePathname();
    const params = useParams();
    const lang = (params?.lang as string) || (pathname?.startsWith("/ru") ? "ru" : "ua");

    if (!items || items.length === 0) {
        return null;
    }

    const currentPath = pathname ? (pathname === "/" || pathname.endsWith("/") ? pathname : `${pathname}/`) : "/";
    const jsonLd = generateBreadcrumbJsonLd(items, lang, canonicalUrl || currentPath);

    return (
        <>
            <nav className={clsx(s.breadcrumbs, className)} aria-label="Breadcrumb">
                {items.map((item, index) => {
                    return (
                        <div key={index} className={s.item}>
                            {item.href ? (
                                <AppLink href={item.href} className={s.link}>
                                    {item.label}
                                </AppLink>
                            ) : (
                                <span className={s.current}>{item.label}</span>
                            )}
                            {index < items.length - 1 && (
                                <Image
                                    className={s.separator}
                                    src="/icons/breadcrumbs_arrow.svg"
                                    alt="Arrow"
                                    width="10"
                                    height="9"
                                />
                            )}
                        </div>
                    );
                })}
            </nav>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
                }}
            />
        </>
    );
}

