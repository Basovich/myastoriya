'use client';

import React from 'react';
import s from './FilterPill.module.scss';

interface FilterPillProps {
    children: React.ReactNode;
    active?: boolean;
    onClick?: () => void;
    className?: string;
}

export default function FilterPill({
    children,
    active = false,
    onClick,
    className = '',
}: FilterPillProps) {
    return (
        <button
            type="button"
            className={`${s.optionPill} ${active ? s.optionPillActive : ''} ${className}`}
            onClick={onClick}
        >
            {active && (
                <svg className={s.checkIcon} width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            )}
            {children}
        </button>
    );
}
