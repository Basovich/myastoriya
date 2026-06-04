'use client';
 
import React, { useState } from 'react';
import s from './FilterGroup.module.scss';
import clsx from 'clsx';
 
interface FilterGroupProps {
    title: string;
    children: React.ReactNode;
    initialOpen?: boolean;
    className?: string;
}
 
export default function FilterGroup({
    title,
    children,
    initialOpen = false,
    className = '',
}: FilterGroupProps) {
    const [isOpen, setIsOpen] = useState(initialOpen);
 
    const toggleOpen = () => {
        setIsOpen(!isOpen);
    };
 
    return (
        <div className={clsx(s.filterGroup, className)}>
            <button
                className={s.groupHeader}
                onClick={toggleOpen}
                aria-expanded={isOpen}
                type="button"
            >
                <span className={s.groupTitle}>{title}</span>
                <svg
                    className={clsx(s.arrow, isOpen && s.arrowOpen)}
                    width="12"
                    height="7"
                    viewBox="0 0 12 7"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
            <div className={s.divider} />
            <div className={clsx(s.groupOptionsWrap, isOpen && s.groupOptionsWrapOpen)}>
                <div className={s.groupOptions}>
                    {children}
                </div>
            </div>
        </div>
    );
}
