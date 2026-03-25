'use client';

import React, { TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';
import s from './TextareaField.module.scss';

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    id: string;
    label: string;
    required?: boolean;
    error?: string;
    touched?: boolean;
}

export default function Index({
    id,
    label,
    required = false,
    error,
    touched = false,
    className,
    onFocus,
    ...rest
}: TextareaFieldProps) {
    const hasError = touched && !!error;

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        onFocus?.(e);
    };

    return (
        <div className={s.fieldWrapper}>
            <textarea
                id={id}
                className={clsx(s.textarea, hasError && s.textareaError, className)}
                placeholder=" "
                onFocus={handleFocus}
                aria-invalid={hasError}
                aria-describedby={hasError ? `${id}-error` : undefined}
                {...rest}
            />
            <label className={s.label} htmlFor={id}>
                {label}
                {required && <span className={s.asterisk}>*</span>}
            </label>
            {hasError && (
                <span id={`${id}-error`} className={s.errorText} role="alert">
                    {error}
                </span>
            )}
        </div>
    );
}
