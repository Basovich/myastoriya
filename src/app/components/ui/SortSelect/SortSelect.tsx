'use client';

import React from 'react';
import s from './SortSelect.module.scss';

interface SortSelectProps {
    value: string;
    options: string[];
    onChange: (value: string) => void;
    label?: string;
    className?: string;
}

export default function SortSelect({
    value,
    options,
    onChange,
    label,
    className = '',
}: SortSelectProps) {
    return (
        <div className={`${s.sortWrap} ${className}`}>
            {label && <span className={s.sortLabel}>{label}</span>}
            <div className={s.sortSelectWrap}>
                <select
                    className={s.sortSelect}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    aria-label={label || "Сортування"}
                >
                    {options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
                <svg className={s.sortArrow} width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
        </div>
    );
}
