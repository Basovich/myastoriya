'use client';

import React, { forwardRef } from 'react';
import ReactDatePicker, { registerLocale } from 'react-datepicker';
import { uk } from 'date-fns/locale';
import { format, isToday, isTomorrow } from 'date-fns';
import clsx from 'clsx';
import s from './DatePicker.module.scss';
import "react-datepicker/dist/react-datepicker.css";

registerLocale('uk', uk);

interface DatePickerProps {
    id?: string;
    selected: Date | null;
    onChange: (date: Date | null) => void;
    onBlur?: () => void;
    placeholder?: string;
    className?: string;
    minDate?: Date;
    maxDate?: Date;
    label?: string;
    error?: string;
    touched?: boolean;
    required?: boolean;
}

const CustomInput = forwardRef<HTMLButtonElement, { id?: string; value?: string; onClick?: () => void; label: string; error?: boolean; hasValue?: boolean; required?: boolean; onBlur?: () => void }>(
    ({ id, value, onClick, label, error, hasValue, required, onBlur }, ref) => (
        <button id={id} className={clsx(s.customInput, error && s.inputError)} onClick={onClick} ref={ref} type="button" onBlur={onBlur}>
            <div className={s.inputContent}>
                <span className={clsx(s.floatingLabel, (hasValue || !!value) && s.floating)}>
                    {label}
                    {required && <span className={s.asterisk}>*</span>}
                </span>
                <span className={s.inputValue}>{value}</span>
            </div>
            <svg className={s.calendarIcon} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.8333 3.33334H4.16667C3.24619 3.33334 2.5 4.07954 2.5 5.00001V16.6667C2.5 17.5872 3.24619 18.3333 4.16667 18.3333H15.8333C16.7538 18.3333 17.5 17.5872 17.5 16.6667V5.00001C17.5 4.07954 16.7538 3.33334 15.8333 3.33334Z" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.3333 1.66666V5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6.66666 1.66666V5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2.5 8.33334H17.5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </button>
    )
);

CustomInput.displayName = 'CustomInput';

export default function DatePicker({
    id,
    selected,
    onChange,
    onBlur,
    placeholder = 'Оберіть дату',
    className,
    minDate,
    maxDate,
    label,
    error,
    touched,
    required
}: DatePickerProps) {
    const isErr = touched && !!error;

    return (
        <div className={clsx(s.datePickerWrapper, className)}>
            <ReactDatePicker
                selected={selected}
                onChange={onChange}
                locale="uk"
                dateFormat="dd.MM.yyyy"
                minDate={minDate}
                maxDate={maxDate}
                customInput={
                    <CustomInput 
                        id={id}
                        label={label || placeholder} 
                        error={isErr} 
                        hasValue={!!selected}
                        required={required}
                        onBlur={onBlur}
                    />
                }
                calendarStartDay={1}
                peekNextMonth
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
            />
            {isErr && (
                <span className={s.errorText} role="alert">
                    {error}
                </span>
            )}
        </div>
    );
}
