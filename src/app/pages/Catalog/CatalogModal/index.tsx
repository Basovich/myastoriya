'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTransition, animated, config } from '@react-spring/web';
import s from './FilterModal.module.scss';
import FilterSidebar from '@/app/pages/Catalog/CatalogSidebar';
import type { FilterBlock, FilterStateInput } from '@/lib/graphql';
import { useIsHydrated } from '@/hooks/useIsHydrated';
import useScrollLock from '@/hooks/useScrollLock';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    sortBy?: string;
    onSortChange?: (value: string) => void;
    categoryId?: number;
    sortOptions?: string[];
    filterLabel?: string;
    clearLabel?: string;
    filterBlocks?: FilterBlock[];
    activeFilters?: FilterStateInput[];
    hasMixedRawProduction?: boolean;
}

export default function  CatalogModal({ isOpen, onClose, sortBy, onSortChange, categoryId, sortOptions, filterLabel = "Фільтр", clearLabel = "Очистити", filterBlocks, activeFilters, hasMixedRawProduction }: FilterModalProps) {
    const mounted = useIsHydrated();
    const [clearTrigger, setClearTrigger] = useState(0);
    const [isModified, setIsModified] = useState(false);
    const { disableScroll, enableScroll } = useScrollLock();

    const handleClearAll = () => {
        setClearTrigger((prev: number) => prev + 1);
        if (onSortChange) {
            onSortChange(sortOptions?.[0] || 'За популярністю');
        }
    };

    // Prevent body scroll when open using project scroll lock hook
    useEffect(() => {
        if (isOpen) {
            disableScroll();
            return () => enableScroll();
        }
    }, [isOpen, disableScroll, enableScroll]);

    // Transition for the overlay (fade) and drawer (slide up)
    const transitions = useTransition(isOpen, {
        from: { opacity: 0, transform: 'translateY(100%)' },
        enter: { opacity: 1, transform: 'translateY(0%)' },
        leave: { opacity: 0, transform: 'translateY(100%)' },
        config: { ...config.stiff, clamp: true }
    });

    if (!mounted) return null;

    const modalContent = transitions((style, item) => item ? (
        <animated.div 
            className={s.overlay} 
            onClick={onClose} 
            role="dialog" 
            aria-modal="true" 
            aria-label={filterLabel}
            style={{ opacity: style.opacity }}
        >
            <animated.div 
                className={s.drawer} 
                onClick={e => e.stopPropagation()}
                style={{ transform: style.transform }}
            >
                <div className={s.header}>
                    <button
                        type="button"
                        className={s.closeBtn}
                        onClick={onClose}
                        aria-label={filterLabel}
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1L19 19M19 1L1 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                    <h2 className={s.title}>{filterLabel}</h2>
                    {isModified && (
                        <button
                            type="button"
                            className={s.clearBtn}
                            onClick={handleClearAll}
                        >
                            {clearLabel}
                        </button>
                    )}
                </div>
                <div className={s.body}>
                    <FilterSidebar 
                        onClose={onClose} 
                        sortBy={sortBy} 
                        onSortChange={onSortChange}
                        onClearAll={() => {}} 
                        onModifiedChange={setIsModified}
                        key={clearTrigger} 
                        categoryId={categoryId}
                        sortOptions={sortOptions}
                        filterBlocks={filterBlocks}
                        activeFilters={activeFilters}
                        hasMixedRawProduction={hasMixedRawProduction}
                    />
                </div>
            </animated.div>
        </animated.div>
    ) : null);

    return createPortal(modalContent, document.body);
}
