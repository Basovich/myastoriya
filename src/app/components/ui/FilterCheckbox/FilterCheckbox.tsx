'use client';

import React from 'react';
import s from './FilterCheckbox.module.scss';

interface FilterCheckboxProps {
    children: React.ReactNode;
    active?: boolean;
    onClick?: () => void;
    className?: string;
}

export default function FilterCheckbox({
    children,
    active = false,
    onClick,
    className = '',
}: FilterCheckboxProps) {
    return (
        <button
            type="button"
            className={`${s.checkboxLabel} ${className}`}
            onClick={onClick}
            role="checkbox"
            aria-checked={active}
        >
            <span className={s.labelText}>{children}</span>
            <span className={`${s.checkbox} ${active ? s.checkboxActive : ''}`}>
                {active && (
                    <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                )}
            </span>
        </button>
    );
}
