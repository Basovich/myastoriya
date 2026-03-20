'use client';

import React from 'react';
import s from './Pagination.module.scss';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    className = '',
}: PaginationProps) {
    if (totalPages <= 1) return null;

    const getVisiblePages = (current: number, total: number) => {
        if (total <= 5) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }
        if (current <= 3) {
            return [1, 2, 3, 4, '...', total];
        }
        if (current >= total - 2) {
            return [1, '...', total - 3, total - 2, total - 1, total];
        }
        return [1, '...', current - 1, current, current + 1, '...', total];
    };

    const visiblePages = getVisiblePages(currentPage, totalPages);

    return (
        <div className={`${s.pagination} ${className}`}>
            <button
                type="button"
                className={s.pageNavBtn}
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                aria-label="Попередня сторінка"
            >
                <svg width="8" height="13" viewBox="0 0 8 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 1L1 6.5L7 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
            
            {visiblePages.map((page, idx) => {
                if (page === '...') {
                    return <span key={`ellipsis-${idx}`} className={s.ellipsis}>...</span>;
                }
                return (
                    <button
                        key={page}
                        type="button"
                        className={`${s.pageBtn} ${currentPage === page ? s.pageBtnActive : ''}`}
                        onClick={() => onPageChange(page as number)}
                        aria-label={`Сторінка ${page}`}
                        aria-current={currentPage === page ? 'page' : undefined}
                    >
                        {String(page).padStart(2, '0')}
                    </button>
                );
            })}
            
            <button
                type="button"
                className={s.pageNavBtn}
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                aria-label="Наступна сторінка"
            >
                <svg width="8" height="13" viewBox="0 0 8 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L7 6.5L1 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
        </div>
    );
}
