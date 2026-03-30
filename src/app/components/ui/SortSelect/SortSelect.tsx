'use client';

import React, { useState, useRef, useEffect } from 'react';
import s from './SortSelect.module.scss';
import clsx from 'clsx';

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
    label = 'Сортувати:',
    className = '',
}: SortSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option: string) => {
        onChange(option);
        setIsOpen(false);
    };

    return (
        <div className={clsx(s.sortWrap, className)} ref={dropdownRef}>
            {label && <span className={s.sortLabel}>{label}</span>}
            <div className={s.sortSelectWrap}>
                <button
                    type="button"
                    className={clsx(s.sortSelectBtn, isOpen && s.isOpen)}
                    onClick={() => setIsOpen(!isOpen)}
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                >
                    <span className={s.sortValue}>{value}</span>
                    <svg className={s.sortArrow} width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
                
                {isOpen && (
                    <div className={s.sortDropdown} role="listbox">
                        <ul className={s.optionsList}>
                            {options.map((opt) => (
                                <li
                                    key={opt}
                                    className={clsx(s.optionItem, value === opt && s.optionSelected)}
                                    onClick={() => handleSelect(opt)}
                                    role="option"
                                    aria-selected={value === opt}
                                >
                                    {opt}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
