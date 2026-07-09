'use client';

import React, { forwardRef, useState } from 'react';
import ReactDatePicker, { registerLocale } from 'react-datepicker';
import CustomSelect from '@/app/components/ui/CustomSelect/CustomSelect';
import { uk } from 'date-fns/locale';
import { format, isToday, isTomorrow } from 'date-fns';
import clsx from 'clsx';
import s from './DatePicker.module.scss';
import "react-datepicker/dist/react-datepicker.css";

registerLocale('uk', uk);

interface DatePickerProps {
    id?: string;
    selected?: Date | null;
    onChange?: (date: Date | null) => void;
    startDate?: Date | null;
    endDate?: Date | null;
    selectsRange?: boolean;
    onChangeRange?: (dates: [Date | null, Date | null]) => void;
    onClear?: (e: React.SyntheticEvent) => void;
    onBlur?: () => void;
    placeholder?: string;
    className?: string;
    minDate?: Date;
    maxDate?: Date;
    label?: string;
    error?: string;
    touched?: boolean;
    required?: boolean;
    hideIcon?: boolean;
    hideLabel?: boolean;
    leftIcon?: React.ReactNode;
    arrowVariant?: 'down' | 'right';
    lang?: 'ua' | 'ru';
    prefixLabel?: string;
}

const CustomInput = forwardRef<
    HTMLButtonElement, 
    { 
        id?: string; 
        value?: string; 
        onClick?: () => void; 
        label: string; 
        error?: boolean; 
        hasValue?: boolean; 
        required?: boolean; 
        onBlur?: () => void; 
        hideIcon?: boolean;
        hideLabel?: boolean;
        leftIcon?: React.ReactNode;
        arrowVariant?: 'down' | 'right';
        selectedDate?: Date | null;
        startDate?: Date | null;
        endDate?: Date | null;
        selectsRange?: boolean;
        lang?: 'ua' | 'ru';
        onClear?: (e: React.SyntheticEvent) => void;
        prefixLabel?: string;
        isOpen?: boolean;
        onToggle?: () => void;
    }
>(
    ({ id, value, onClick, label, error, hasValue, required, onBlur, hideIcon, hideLabel, leftIcon, arrowVariant = 'down', selectedDate, startDate, endDate, selectsRange, lang = 'ua', prefixLabel, isOpen, onToggle }, ref) => {
        let displayValue = value;
        if (selectsRange) {
            if (startDate) {
                const startStr = format(startDate, 'dd.MM.yyyy');
                if (endDate) {
                    const endStr = format(endDate, 'dd.MM.yyyy');
                    displayValue = `${startStr} - ${endStr}`;
                } else {
                    displayValue = startStr;
                }
            } else {
                displayValue = '';
            }
        } else if (selectedDate) {
            if (isToday(selectedDate)) {
                displayValue = lang === 'ua' ? 'Сьогодні' : 'Сегодня';
            } else if (isTomorrow(selectedDate)) {
                displayValue = lang === 'ua' ? 'Завтра' : 'Завтра';
            }
        }
        
        return (
            <button
                id={id}
                className={clsx(s.customInput, 'customInput', error && s.inputError)}
                onClick={() => {
                    if (onToggle) onToggle();
                    if (onClick) onClick();
                }}
                ref={ref}
                type="button"
                onBlur={onBlur}
            >
                {hideLabel ? (
                    <div className={s.selectContent}>
                        {leftIcon && <div className={s.leftIcon}>{leftIcon}</div>}
                        <span className={clsx(s.selectValue, !displayValue && s.placeholder)}>
                            {prefixLabel && <span className={s.prefixLabel}>{prefixLabel}</span>}
                            <span className={s.valueText}>{displayValue || label}</span>
                        </span>
                    </div>
                ) : (
                    <div className={s.inputContent}>
                        <span className={clsx(s.floatingLabel, (hasValue || !!displayValue) && s.floating)}>
                            {label}
                            {required && <span className={s.asterisk}>*</span>}
                        </span>
                        <span className={s.inputValue}>{displayValue}</span>
                    </div>
                )}
                <div className={s.inputActions}>
                    {hideLabel ? (
                        arrowVariant === 'down' ? (
                            <svg className={clsx(s.arrow, isOpen && s.arrowOpen)} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        ) : (
                            <svg className={s.arrowRight} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )
                    ) : !hideIcon ? (
                        <svg className={s.calendarIcon} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.8333 3.33334H4.16667C3.24619 3.33334 2.5 4.07954 2.5 5.00001V16.6667C2.5 17.5872 3.24619 18.3333 4.16667 18.3333H15.8333C16.7538 18.3333 17.5 17.5872 17.5 16.6667V5.00001C17.5 4.07954 16.7538 3.33334 15.8333 3.33334Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M13.3333 1.66666V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6.66666 1.66666V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2.5 8.33334H17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    ) : null}
                </div>
            </button>
        );
    }
);

CustomInput.displayName = 'CustomInput';

const YEARS = Array.from({ length: new Date().getFullYear() - 1920 + 1 }, (_, i) => 1920 + i).reverse();
const MONTHS = [
    'січень', 'лютий', 'березень', 'квітень', 'травень', 'червень',
    'липень', 'серпень', 'вересень', 'жовтень', 'листопад', 'грудень'
];



export default function DatePicker({
    id,
    selected,
    onChange,
    startDate,
    endDate,
    selectsRange,
    onChangeRange,
    onClear,
    onBlur,
    placeholder = 'Оберіть дату',
    className,
    minDate,
    maxDate,
    label,
    error,
    touched,
    required,
    hideIcon,
    hideLabel,
    leftIcon,
    arrowVariant,
    lang,
    prefixLabel
}: DatePickerProps) {
    const isValidDate = selected instanceof Date && !isNaN(selected.getTime());
    const safeSelected = isValidDate ? selected : null;
    const isErr = touched && !!error;
    const DatePickerComponent = ReactDatePicker as React.ElementType;

    const [isOpen, setIsOpen] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const openCalendar = () => {
        setIsClosing(false);
        setShouldRender(true);
        setIsOpen(true);
    };

    const closeCalendar = () => {
        setIsClosing(true);
        setIsOpen(false);
        setTimeout(() => {
            setShouldRender(false);
            setIsClosing(false);
        }, 200);
    };

    const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (target && (target.closest(`.${s.customInput}`) || (id && target.closest(`#${id}`)))) {
            return;
        }
        closeCalendar();
    };

    const datePickerDict = {
        ua: {
            clear: "Очистити",
            chooseDate: "Оберіть дату",
        },
        ru: {
            clear: "Очистить",
            chooseDate: "Выберите дату",
        }
    };
    const t = datePickerDict[lang || 'ua'] || datePickerDict.ua;
    const hasValue = selectsRange ? !!startDate : !!selected;

    return (
        <div className={clsx(s.datePickerWrapper, className)}>
            <div className={s.pickerRow}>
                <div className={s.pickerContainer}>
                    <DatePickerComponent
                        selectsRange={selectsRange}
                        startDate={startDate || undefined}
                        endDate={endDate || undefined}
                        selected={selectsRange ? null : safeSelected}
                        onChange={(val: Date | [Date | null, Date | null] | null) => {
                            if (selectsRange) {
                                if (onChangeRange) {
                                    onChangeRange(val as [Date | null, Date | null]);
                                }
                                const [start, end] = (val as [Date | null, Date | null]) || [null, null];
                                if (start && end) {
                                    closeCalendar();
                                }
                            } else {
                                if (onChange) {
                                    onChange(val as Date | null);
                                }
                                closeCalendar();
                            }
                        }}
                        locale="uk"
                        dateFormat="dd.MM.yyyy"
                        minDate={minDate}
                        maxDate={maxDate}
                        open={shouldRender}
                        calendarClassName={isClosing ? s.calendarClosing : undefined}
                        onClickOutside={handleClickOutside}
                        renderCustomHeader={({
                            date,
                            changeYear,
                            changeMonth,
                            decreaseMonth,
                            increaseMonth,
                            prevMonthButtonDisabled,
                            nextMonthButtonDisabled,
                        }: {
                            date: Date;
                            changeYear: (year: number) => void;
                            changeMonth: (month: number) => void;
                            decreaseMonth: () => void;
                            increaseMonth: () => void;
                            prevMonthButtonDisabled: boolean;
                            nextMonthButtonDisabled: boolean;
                        }) => (
                            <div className={s.customHeaderContainer} onClick={(e) => e.stopPropagation()}>
                                <button
                                    type="button"
                                    className={s.navBtn}
                                    onClick={decreaseMonth}
                                    disabled={prevMonthButtonDisabled}
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                                
                                <div className={s.headerSelects}>
                                    <CustomSelect
                                        value={date.getMonth().toString()}
                                        options={MONTHS.map((month, index) => ({
                                            label: month,
                                            value: index.toString(),
                                        }))}
                                        onChange={(val) => changeMonth(Number(val))}
                                        variant="compact"
                                    />

                                    <CustomSelect
                                        value={date.getFullYear().toString()}
                                        options={YEARS.map((year) => ({
                                            label: year.toString(),
                                            value: year.toString(),
                                        }))}
                                        onChange={(val) => changeYear(Number(val))}
                                        variant="compact"
                                    />
                                </div>

                                <button
                                    type="button"
                                    className={s.navBtn}
                                    onClick={increaseMonth}
                                    disabled={nextMonthButtonDisabled}
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                            </div>
                        )}
                        customInput={
                            <CustomInput 
                                id={id}
                                label={label || placeholder} 
                                error={isErr} 
                                hasValue={hasValue}
                                required={required}
                                onBlur={onBlur}
                                hideIcon={hideIcon}
                                hideLabel={hideLabel}
                                leftIcon={leftIcon}
                                arrowVariant={arrowVariant}
                                selectedDate={safeSelected}
                                startDate={startDate}
                                endDate={endDate}
                                selectsRange={selectsRange}
                                lang={lang}
                                onClear={onClear}
                                prefixLabel={prefixLabel}
                                isOpen={isOpen}
                                onToggle={shouldRender ? closeCalendar : openCalendar}
                            />
                        }
                        calendarStartDay={1}
                        peekNextMonth
                    />
                </div>
                {onClear && hasValue && (
                    <span 
                        role="button"
                        tabIndex={0}
                        className={s.clearTextBtn} 
                        onClick={(e) => {
                            e.stopPropagation();
                            onClear(e);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.stopPropagation();
                                e.preventDefault();
                                onClear(e);
                            }
                        }}
                    >
                        {t.clear}
                    </span>
                )}
            </div>
            {isErr && (
                <span className={s.errorText} role="alert">
                    {error}
                </span>
            )}
        </div>
    );
}
