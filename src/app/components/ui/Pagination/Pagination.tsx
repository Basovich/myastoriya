'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import s from './Pagination.module.scss';
import clsx from 'clsx';

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange?: (page: number) => void;
    /** Optional custom function to construct URL for a given page number */
    getPageUrl?: (page: number) => string;
    /** Optional base URL if pathname needs to be overridden */
    baseUrl?: string;
    className?: string;
}

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    getPageUrl,
    baseUrl,
    className = '',
}: PaginationProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    if (totalPages <= 1) return null;

    const buildUrl = (page: number): string => {
        if (getPageUrl) {
            return getPageUrl(page);
        }
        const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
        if (page > 1) {
            params.set('page', String(page));
        } else {
            params.delete('page');
        }
        const queryString = params.toString();
        const basePath = baseUrl || pathname || '';
        return queryString ? `${basePath}?${queryString}` : (basePath || '?');
    };

    const handlePageClick = (e: React.MouseEvent<HTMLAnchorElement>, page: number) => {
        if (onPageChange) {
            e.preventDefault();
            onPageChange(page);
        }
    };

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
    const prevPage = Math.max(1, currentPage - 1);
    const nextPage = Math.min(totalPages, currentPage + 1);
    const isPrevDisabled = currentPage === 1;
    const isNextDisabled = currentPage === totalPages;

    return (
        <div className={clsx(s.pagination, className)}>
            {isPrevDisabled ? (
                <span
                    className={clsx(s.pageNavBtn, s.disabled)}
                    aria-label="Попередня сторінка"
                    aria-disabled="true"
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
                </span>
            ) : (
                <Link
                    href={buildUrl(prevPage)}
                    className={s.pageNavBtn}
                    onClick={(e) => handlePageClick(e, prevPage)}
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
                </Link>
            )}

            {visiblePages.map((page, idx) => {
                if (page === '...') {
                    return (
                        <span key={`ellipsis-${idx}`} className={s.ellipsis}>
                            ...
                        </span>
                    );
                }
                const pageNum = page as number;
                const isActive = currentPage === pageNum;
                return (
                    <Link
                        key={pageNum}
                        href={buildUrl(pageNum)}
                        className={clsx(s.pageBtn, isActive && s.pageBtnActive)}
                        onClick={(e) => handlePageClick(e, pageNum)}
                        aria-label={`Сторінка ${pageNum}`}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        {String(pageNum).padStart(2, '0')}
                    </Link>
                );
            })}

            {isNextDisabled ? (
                <span
                    className={clsx(s.pageNavBtn, s.pageNavNextBtn, s.disabled)}
                    aria-label="Наступна сторінка"
                    aria-disabled="true"
                >
                    <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 56 56"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ transform: 'rotate(180deg)' }}
                    >
                        <circle cx="28" cy="28" r="28" fill="white" />
                        <path
                            d="M16.2929 27.2929C15.9024 27.6834 15.9024 28.3166 16.2929 28.7071L22.6569 35.0711C23.0474 35.4616 23.6805 35.4616 24.0711 35.0711C24.4616 34.6805 24.4616 34.0474 24.0711 33.6569L18.4142 28L24.0711 22.3431C24.4616 21.9526 24.4616 21.3195 24.0711 20.9289C23.6805 20.5384 23.0474 20.5384 22.6569 20.9289L16.2929 27.2929ZM39 28V27L17 27V28V29L39 29V28Z"
                            fill="#E30613"
                        />
                    </svg>
                </span>
            ) : (
                <Link
                    href={buildUrl(nextPage)}
                    className={clsx(s.pageNavBtn, s.pageNavNextBtn)}
                    onClick={(e) => handlePageClick(e, nextPage)}
                    aria-label="Наступна сторінка"
                >
                    <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 56 56"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ transform: 'rotate(180deg)' }}
                    >
                        <circle cx="28" cy="28" r="28" fill="white" />
                        <path
                            d="M16.2929 27.2929C15.9024 27.6834 15.9024 28.3166 16.2929 28.7071L22.6569 35.0711C23.0474 35.4616 23.6805 35.4616 24.0711 35.0711C24.4616 34.6805 24.4616 34.0474 24.0711 33.6569L18.4142 28L24.0711 22.3431C24.4616 21.9526 24.4616 21.3195 24.0711 20.9289C23.6805 20.5384 23.0474 20.5384 22.6569 20.9289L16.2929 27.2929ZM39 28V27L17 27V28V29L39 29V28Z"
                            fill="#E30613"
                        />
                    </svg>
                </Link>
            )}
        </div>
    );
}
