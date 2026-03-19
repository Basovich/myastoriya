'use client';

import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import s from './CustomSelect.module.scss';

export interface SelectOption {
    label: string;
    value: string;
}

interface CustomSelectProps {
    value: string;
    options: SelectOption[];
    onChange: (value: string) => void;
    onBlur?: () => void;
    placeholder?: string;
    error?: boolean;
    className?: string;
}

export default function CustomSelect({
    value,
    options,
    onChange,
    onBlur,
    placeholder = 'Оберіть варіант',
    error = false,
    className = '',
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                if (isOpen && onBlur) onBlur();
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onBlur]);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className={clsx(s.selectWrapper, className)} ref={dropdownRef}>
            <button
                type="button"
                className={clsx(s.selectBtn, error && s.selectError, isOpen && s.isOpen)}
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <span className={clsx(s.selectValue, !selectedOption && s.placeholder)}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <svg className={s.arrow} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
            
            {isOpen && (
                <div className={s.dropdown} role="listbox">
                    <ul className={s.optionsList}>
                        {options.map((opt) => (
                            <li
                                key={opt.value}
                                className={clsx(s.optionItem, value === opt.value && s.optionSelected)}
                                onClick={() => handleSelect(opt.value)}
                                role="option"
                                aria-selected={value === opt.value}
                            >
                                {opt.label}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
