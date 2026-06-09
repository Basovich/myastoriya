'use client';

import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import s from './SearchableSelect.module.scss';

interface Option {
    id: number | string;
    name: string;
}

interface SearchableSelectProps {
    id: string;
    label: string;
    value: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    onSearch: (query: string, page: number) => Promise<{ data: Option[]; hasMore: boolean }>;
    onSelect: (option: Option | null) => void;
    className?: string;
}

export default function SearchableSelect({
    id,
    label,
    value,
    placeholder = ' ',
    required = false,
    disabled = false,
    onSearch,
    onSelect,
    className,
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(value);
    const [options, setOptions] = useState<Option[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // Pagination State
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync searchQuery when value prop changes (e.g., cleared by parent or set by map)
    useEffect(() => {
        setSearchQuery(value);
    }, [value]);

    // Handle search query with debounce
    useEffect(() => {
        if (!isOpen || disabled) return;

        const fetchOptions = async () => {
            setIsLoading(true);
            try {
                const result = await onSearch(searchQuery, 1);
                setOptions(result.data);
                setHasMore(result.hasMore);
                setPage(1);
            } catch (error) {
                console.error('Failed to search options:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(fetchOptions, 200);
        return () => clearTimeout(timer);
    }, [searchQuery, isOpen, disabled, onSearch]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchQuery(value); // Revert to confirmed value
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [value]);

    const handleFocus = async () => {
        if (disabled) return;
        setIsFocused(true);
        setIsOpen(true);
        // Clear query on focus so user can see all options immediately
        setSearchQuery('');
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const handleSelectOption = (option: Option) => {
        onSelect(option);
        setSearchQuery(option.name);
        setIsOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect(null);
        setSearchQuery('');
        setIsOpen(false);
        inputRef.current?.focus();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        if (!isOpen) {
            setIsOpen(true);
        }
    };

    const handleLoadMore = async () => {
        if (isLoadingMore || !hasMore) return;
        setIsLoadingMore(true);
        try {
            const nextPage = page + 1;
            const result = await onSearch(searchQuery, nextPage);
            setOptions(prev => [...prev, ...result.data]);
            setHasMore(result.hasMore);
            setPage(nextPage);
        } catch (error) {
            console.error('Failed to load more options:', error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const reachedBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
        if (reachedBottom) {
            handleLoadMore();
        }
    };

    const hasValue = searchQuery !== '' || value !== '';

    return (
        <div className={clsx(s.wrapper, className, disabled && s.disabled)} ref={wrapperRef}>
            <div className={s.fieldWrapper}>
                <input
                    ref={inputRef}
                    id={id}
                    type="text"
                    className={clsx(
                        s.input,
                        isOpen && s.inputActive,
                        hasValue && s.inputHasValue
                    )}
                    placeholder={placeholder}
                    value={searchQuery}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    disabled={disabled}
                    autoComplete="off"
                />
                <label className={s.label} htmlFor={id}>
                    {label}
                    {required && <span className={s.asterisk}>*</span>}
                </label>

                {/* Arrow indicator or Clear button */}
                <div className={s.iconWrapper}>
                    {value && !disabled ? (
                        <button type="button" className={s.clearBtn} onClick={handleClear} aria-label="Очистити">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    ) : (
                        <svg
                            className={clsx(s.arrowIcon, isOpen && s.arrowIconOpen)}
                            width="10"
                            height="6"
                            viewBox="0 0 10 6"
                            fill="none"
                        >
                            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    )}
                </div>
            </div>

            {/* Dropdown Options List */}
            {isOpen && !disabled && (
                <div className={s.dropdown} onScroll={handleScroll}>
                    {isLoading ? (
                        <div className={s.loading}>
                            <div className={s.spinner}></div>
                        </div>
                    ) : options.length > 0 ? (
                        <ul className={s.optionsList}>
                            {options.map((option) => (
                                <li
                                    key={option.id}
                                    className={clsx(s.optionItem, option.name === value && s.optionItemActive)}
                                    onClick={() => handleSelectOption(option)}
                                >
                                    {option.name}
                                </li>
                            ))}
                            {isLoadingMore && (
                                <li className={s.loadingMore}>
                                    <div className={s.spinner}></div>
                                </li>
                            )}
                        </ul>
                    ) : (
                        <div className={s.noOptions}>Не знайдено</div>
                    )}
                </div>
            )}
        </div>
    );
}
