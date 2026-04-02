'use client';

import React from 'react';
import s from './Checkbox.module.scss';
import clsx from 'clsx';

interface CheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    children?: React.ReactNode;
    className?: string;
    id?: string;
}

export default function Checkbox({
    checked,
    onChange,
    children,
    className = '',
    id,
}: CheckboxProps) {
    return (
        <label className={clsx(s.checkboxWrapper, className)} htmlFor={id}>
            <input
                id={id}
                type="checkbox"
                className={s.hiddenInput}
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
            <div className={clsx(s.checkboxCustom, checked && s.checkboxChecked)}>
                {checked && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M1 3.5L3.8 6.5L9 1"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                )}
            </div>
            {children && <span className={s.checkboxText}>{children}</span>}
        </label>
    );
}
