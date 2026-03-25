"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getLocalizedHref } from "@/utils/i18n-helpers";
import { Locale } from "@/i18n/config";
import React from "react";

type AppLinkProps = Omit<React.ComponentProps<typeof Link>, "href"> & {
    href: string;
    ariaLabel?: string;
};

export default function AppLink({
    href,
    children,
    className,
    onClick,
    ariaLabel,
    ...rest
}: AppLinkProps) {
    const params = useParams();
    const lang = (params.lang as Locale) || "ua";

    return (
        <Link
            href={getLocalizedHref(href, lang)}
            className={className}
            onClick={onClick}
            aria-label={ariaLabel}
            {...rest}
        >
            {children}
        </Link>
    );
}
