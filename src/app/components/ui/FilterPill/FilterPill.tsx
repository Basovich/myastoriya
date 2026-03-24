'use client';

import React from 'react';
import s from './FilterPill.module.scss';
import clsx from 'clsx';

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
            className={clsx(s.optionPill, active && s.optionPillActive, className)}
            onClick={onClick}
        >
            {children}
        </button>
    );
}
