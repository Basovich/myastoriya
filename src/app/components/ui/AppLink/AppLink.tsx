"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getLocalizedHref } from "@/utils/i18n-helpers";
import { Locale } from "@/i18n/config";

interface AppLinkProps {
    href: string;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    ariaLabel?: string;
}

export default function AppLink({
    href,
    children,
    className,
    onClick,
    ariaLabel
}: AppLinkProps) {
    const params = useParams();
    const lang = (params.lang as Locale) || "ua";

    return (
        <Link
            href={getLocalizedHref(href, lang)}
            className={className}
            onClick={onClick}
            aria-label={ariaLabel}
        >
            {children}
        </Link>
    );
}
