'use client';

import React from 'react';
import s from './ShowMoreButton.module.scss';
import clsx from 'clsx';

interface ShowMoreButtonProps {
    onClick?: () => void;
    label?: string;
    className?: string;
    fullWidth?: boolean;
}

export default function ShowMoreButton({
    onClick,
    label = 'показати ще',
    className = '',
    fullWidth = false,
}: ShowMoreButtonProps) {
    return (
        <button
            type="button"
            className={clsx(s.showMoreBtn, fullWidth && s.fullWidth, className)}
            onClick={onClick}
        >
            {label}
            <svg width="10" height="15" viewBox="0 0 10 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L9 7.5L1 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </button>
    );
}
