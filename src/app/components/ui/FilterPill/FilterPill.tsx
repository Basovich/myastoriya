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
            {children}
        </button>
    );
}
