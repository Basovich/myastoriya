import React from 'react';
import clsx from 'clsx';
import s from './Spinner.module.scss';

interface SpinnerProps {
    className?: string;
    /** Whether to center the spinner with container paddings */
    centered?: boolean;
}

export default function Spinner({ className, centered = true }: SpinnerProps) {
    const spinnerElement = (
        <svg className={s.spinner} viewBox="0 0 50 50">
            <circle className={s.path} cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
        </svg>
    );

    if (centered) {
        return (
            <div className={clsx(s.spinnerWrapper, className)}>
                {spinnerElement}
            </div>
        );
    }

    return (
        <div className={clsx(s.spinnerInline, className)}>
            {spinnerElement}
        </div>
    );
}
