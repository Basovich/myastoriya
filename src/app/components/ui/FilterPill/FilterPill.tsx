'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import s from './FilterPill.module.scss';
import clsx from 'clsx';
import { getLocalizedHref } from '@/utils/i18n-helpers';
import type { Locale } from '@/i18n/config';

interface FilterPillProps {
    children: React.ReactNode;
    active?: boolean;
    onClick?: (e: React.MouseEvent<HTMLElement>) => void;
    className?: string;
    /** Якщо задано — рендериться звичайне посилання `<a href>` (для SEO-фільтрів), клік перехоплює `onClick`. */
    href?: string;
}

export default function FilterPill({
    children,
    active = false,
    onClick,
    className = '',
    href,
}: FilterPillProps) {
    const params = useParams();
    const classes = clsx(s.optionPill, active && s.optionPillActive, className);

    if (href) {
        const lang = (params?.lang as Locale) || 'ua';
        return (
            <Link
                href={getLocalizedHref(href, lang)}
                className={classes}
                onClick={(e) => {
                    e.preventDefault();
                    onClick?.(e);
                }}
            >
                {children}
            </Link>
        );
    }

    return (
        <button type="button" className={classes} onClick={onClick}>
            {children}
        </button>
    );
}
