'use client';

import React, { useState } from 'react';
import s from './FilterGroup.module.scss';

interface FilterGroupProps {
    title: string;
    children: React.ReactNode;
    initialOpen?: boolean;
    className?: string;
}

export default function FilterGroup({
    title,
    children,
    initialOpen = true,
    className = '',
}: FilterGroupProps) {
    const [isOpen, setIsOpen] = useState(initialOpen);

    return (
        <div className={`${s.filterGroup} ${className}`}>
            <button
                className={s.groupHeader}
                onClick={() => setIsOpen(v => !v)}
                aria-expanded={isOpen}
                type="button"
            >
                <span className={s.groupTitle}>{title}</span>
                <svg
                    className={`${s.arrow} ${isOpen ? s.arrowOpen : ''}`}
                    width="12"
                    height="7"
                    viewBox="0 0 12 7"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
            {isOpen && (
                <div className={s.groupOptions}>
                    {children}
                </div>
            )}
            <div className={s.divider} />
        </div>
    );
}
