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
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0.8" y="0.8" width="7.4" height="7.4" rx="1.2" stroke="currentColor" strokeWidth="1.6"/>
                    <rect x="11.8" y="0.8" width="7.4" height="7.4" rx="1.2" stroke="currentColor" strokeWidth="1.6"/>
                    <rect x="0.8" y="11.8" width="7.4" height="7.4" rx="1.2" stroke="currentColor" strokeWidth="1.6"/>
                    <rect x="11.8" y="11.8" width="7.4" height="7.4" rx="1.2" stroke="currentColor" strokeWidth="1.6"/>
                </svg>
            </button>
            <button
                type="button"
                className={`${s.viewBtn} ${view === 'list' ? s.viewBtnActive : ''}`}
                onClick={() => onViewChange('list')}
                aria-label="Список"
            >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0.8" y="0.8" width="18.4" height="7.4" rx="1.2" stroke="currentColor" strokeWidth="1.6"/>
                    <rect x="0.8" y="11.8" width="18.4" height="7.4" rx="1.2" stroke="currentColor" strokeWidth="1.6"/>
                </svg>
            </button>
        </div>
    );
}
