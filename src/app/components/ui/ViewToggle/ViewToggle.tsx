'use client';

import React from 'react';
import s from './ViewToggle.module.scss';

export type ViewType = 'grid' | 'list';

interface ViewToggleProps {
    view: ViewType;
    onViewChange: (view: ViewType) => void;
    className?: string;
}

export default function ViewToggle({
    view,
    onViewChange,
    className = '',
}: ViewToggleProps) {
    return (
        <div className={`${s.viewToggle} ${className}`}>
            <button
                type="button"
                className={`${s.viewBtn} ${view === 'grid' ? s.viewBtnActive : ''}`}
                onClick={() => onViewChange('grid')}
                aria-label="Сітка"
            >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                    <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                    <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                    <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
            </button>
            <button
                type="button"
                className={`${s.viewBtn} ${view === 'list' ? s.viewBtnActive : ''}`}
                onClick={() => onViewChange('list')}
                aria-label="Список"
            >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="1" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M8 3H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <rect x="1" y="6.5" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M8 8.5H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <rect x="1" y="12" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M8 14H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
            </button>
        </div>
    );
}
