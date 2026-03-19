'use client';

import React, { InputHTMLAttributes } from 'react';
import clsx from 'clsx';
import s from './InputField.module.scss';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    id: string;
    label: string;
    required?: boolean;
    error?: string;
    touched?: boolean;
}

export default function InputField({
    id,
    label,
    required = false,
    error,
    touched = false,
    className,
    onFocus,
    ...rest
}: InputFieldProps) {
    const hasError = touched && !!error;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        // delegate to parent if provided
        onFocus?.(e);
    };

    return (
        <div className={s.fieldWrapper}>
            <input
                id={id}
                className={clsx(s.input, hasError && s.inputError, className)}
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
