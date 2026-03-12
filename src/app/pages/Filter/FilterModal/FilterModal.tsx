'use client';

import { useEffect } from 'react';
import s from './FilterModal.module.scss';
import FilterSidebar from '@/app/pages/Filter/FilterSidebar/FilterSidebar';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function FilterModal({ isOpen, onClose }: FilterModalProps) {
    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className={s.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label="Фільтри">
            <div className={s.drawer} onClick={e => e.stopPropagation()}>
                <div className={s.header}>
                    <h2 className={s.title}>Фільтр</h2>
                    <button
                        type="button"
                        className={s.closeBtn}
                        onClick={onClose}
                        aria-label="Закрити фільтри"
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.5 1.5L18.5 18.5M18.5 1.5L1.5 18.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>
                <div className={s.body}>
                    <FilterSidebar onClose={onClose} />
                </div>
            </div>
        </div>
    );
}
