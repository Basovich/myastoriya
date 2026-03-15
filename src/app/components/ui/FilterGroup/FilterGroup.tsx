'use client';

import React, { useState, useRef, useEffect } from 'react';
import anime from 'animejs';
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
    const contentRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);

    const toggleOpen = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        if (!contentRef.current || !innerRef.current) return;
        
        anime({
            targets: contentRef.current,
            height: isOpen ? innerRef.current.scrollHeight : 0,
            duration: 350,
            easing: 'easeInOutQuad'
        });
    }, [isOpen]);

    return (
        <div className={`${s.filterGroup} ${className}`}>
            <button
                className={s.groupHeader}
                onClick={toggleOpen}
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
            <div 
                className={s.groupOptionsWrap} 
                ref={contentRef}
                style={{ height: initialOpen ? 'auto' : 0, overflow: 'hidden' }}
            >
                <div className={s.groupOptions} ref={innerRef}>
                    {children}
                </div>
            </div>
            <div className={s.divider} />
        </div>
    );
}
