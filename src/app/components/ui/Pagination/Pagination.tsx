'use client';

import React from 'react';
import s from './Pagination.module.scss';
import clsx from "clsx";

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
        <div className={clsx(s.pagination, className)}>
            <button
                type="button"
                className={s.pageNavBtn}
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                aria-label="Попередня сторінка"
            >
                <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 56 56"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle cx="28" cy="28" r="28" fill="white" />
                    <path
                        d="M16.2929 27.2929C15.9024 27.6834 15.9024 28.3166 16.2929 28.7071L22.6569 35.0711C23.0474 35.4616 23.6805 35.4616 24.0711 35.0711C24.4616 34.6805 24.4616 34.0474 24.0711 33.6569L18.4142 28L24.0711 22.3431C24.4616 21.9526 24.4616 21.3195 24.0711 20.9289C23.6805 20.5384 23.0474 20.5384 22.6569 20.9289L16.2929 27.2929ZM39 28V27L17 27V28V29L39 29V28Z"
                        fill="#E30613"
                    />
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
                        className={clsx(s.pageBtn, currentPage === page && s.pageBtnActive)}
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
                className={clsx(s.pageNavBtn, s.pageNavNextBtn)}
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                aria-label="Наступна сторінка"
            >
                <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 56 56"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ transform: "rotate(180deg)" }}
                >
                    <circle cx="28" cy="28" r="28" fill="white" />
                    <path
                        d="M16.2929 27.2929C15.9024 27.6834 15.9024 28.3166 16.2929 28.7071L22.6569 35.0711C23.0474 35.4616 23.6805 35.4616 24.0711 35.0711C24.4616 34.6805 24.4616 34.0474 24.0711 33.6569L18.4142 28L24.0711 22.3431C24.4616 21.9526 24.4616 21.3195 24.0711 20.9289C23.6805 20.5384 23.0474 20.5384 22.6569 20.9289L16.2929 27.2929ZM39 28V27L17 27V28V29L39 29V28Z"
                        fill="#E30613"
                    />
                </svg>
            </button>
        </div>
    );
}
