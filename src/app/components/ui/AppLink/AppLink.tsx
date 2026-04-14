"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { getLocalizedHref } from "@/utils/i18n-helpers";
import { Locale } from "@/i18n/config";
import React from "react";
import clsx from "clsx";

type AppLinkProps = Omit<React.ComponentProps<typeof Link>, "href"> & {
    href: string;
    ariaLabel?: string;
    activeClassName?: string;
};

export default function AppLink({
    href,
    children,
    className,
    onClick,
    ariaLabel,
    activeClassName,
    ...rest
}: AppLinkProps) {
    const params = useParams();
    const pathname = usePathname();
    const lang = (params.lang as Locale) || "ua";
    
    const localizedHref = getLocalizedHref(href, lang);
    const isActive = pathname === localizedHref;

    if (isActive) {
        return (
            <span 
                className={clsx(className, activeClassName)} 
                aria-current="page"
                style={{ cursor: 'default' }}
            >
                {children}
            </span>
        );
    }

    return (
        <Link
            href={localizedHref}
            className={className}
            onClick={onClick}
            aria-label={ariaLabel}
            {...rest}
        >
            {children}
        </Link>
    );
}
