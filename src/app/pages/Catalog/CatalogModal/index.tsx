'use client';

import { useEffect, useState } from 'react';
import { useTransition, animated, config } from '@react-spring/web';
import s from './FilterModal.module.scss';
import FilterSidebar from '@/app/pages/Catalog/CatalogSidebar';
interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    sortBy?: string;
    onSortChange?: (value: string) => void;
    category?: string;
}

export default function  CatalogModal({ isOpen, onClose, sortBy, onSortChange, category }: FilterModalProps) {
    const [clearTrigger, setClearTrigger] = useState(0);
    const [isModified, setIsModified] = useState(false);

    const handleClearAll = () => {
        setClearTrigger((prev: number) => prev + 1);
        if (onSortChange) {
            onSortChange('За замовчуванням');
        }
    };

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

    // Transition for the overlay (fade) and drawer (slide up)
    const transitions = useTransition(isOpen, {
        from: { opacity: 0, transform: 'translateY(100%)' },
        enter: { opacity: 1, transform: 'translateY(0%)' },
        leave: { opacity: 0, transform: 'translateY(100%)' },
        config: { ...config.stiff, clamp: true }
    });

    return transitions((style, item) => item ? (
        <animated.div 
            className={s.overlay} 
            onClick={onClose} 
            role="dialog" 
            aria-modal="true" 
            aria-label="Фільтри"
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
                        aria-label="Закрити фільтри"
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1L19 19M19 1L1 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                    <h2 className={s.title}>Фільтр</h2>
                    {isModified && (
                        <button
                            type="button"
                            className={s.clearBtn}
                            onClick={handleClearAll}
                        >
                            Очистити
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
                        category={category}
                    />
                </div>
            </animated.div>
        </animated.div>
    ) : null);
}
