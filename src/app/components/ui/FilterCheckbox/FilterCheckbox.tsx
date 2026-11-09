'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import s from './FilterCheckbox.module.scss';
import clsx from 'clsx';
import { getLocalizedHref } from '@/utils/i18n-helpers';
import type { Locale } from '@/i18n/config';

interface FilterCheckboxProps {
    children: React.ReactNode;
    active?: boolean;
    onClick?: (e: React.MouseEvent<HTMLElement>) => void;
    className?: string;
    /** Якщо задано — рендериться звичайне посилання `<a href>` (для SEO-фільтрів), клік перехоплює `onClick`. */
    href?: string;
}

export default function FilterCheckbox({
    children,
    active = false,
    onClick,
    className = '',
    href,
}: FilterCheckboxProps) {
    const params = useParams();

    const content = (
        <>
            <span className={s.labelText}>{children}</span>
            <span className={clsx(s.checkbox, active && s.checkboxActive)}>
                {active && (
                    <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                )}
            </span>
        </>
    );

    if (href) {
        const lang = (params?.lang as Locale) || 'ua';
        return (
            <Link
                href={getLocalizedHref(href, lang)}
                className={clsx(s.checkboxLabel, className)}
                data-no-progress="true"
                onClick={(e) => {
                    e.preventDefault();
                    onClick?.(e);
                }}
                role="checkbox"
                aria-checked={active}
            >
                {content}
            </Link>
        );
    }

    return (
        <button
            type="button"
            className={clsx(s.checkboxLabel, className)}
            onClick={onClick}
            role="checkbox"
            aria-checked={active}
        >
            {content}
        </button>
    );
}
