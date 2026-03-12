'use client';

import { useState, useCallback } from 'react';
import s from './FilterSidebar.module.scss';

interface FilterState {
    priceFrom: number;
    priceTo: number;
    meatPart: string[];
    meatType: string[];
    aging: string[];
    marbling: string[];
    country: string[];
    breed: string[];
}

const MEAT_PARTS = ['Антрекот', 'Стегно', 'Биток', 'Вирізка', 'Філе', 'Ошийок'];
const MEAT_TYPES = ['Фермерська курка', 'Яловичина', 'Асорті', 'Кролятина', "М'ясо індички", "М'ясо качки", 'Ягня'];
const AGING_OPTIONS = ['Тижень', '2 тижні', 'Місяць', '2 місяці'];
const MARBLING_OPTIONS = ['Choice', 'Select', 'Prime'];
const COUNTRY_OPTIONS = ['Україна', 'США', 'Австралія', 'Аргентина'];
const BREED_OPTIONS = ['Ангус', 'Герефорд', 'Вагю', 'Симентальська'];

const MIN_PRICE = 0;
const MAX_PRICE = 10000;

interface FilterGroupProps {
    title: string;
    options: string[];
    selected: string[];
    onChange: (value: string) => void;
}

function FilterGroup({ title, options, selected, onChange }: FilterGroupProps) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className={s.filterGroup}>
            <button
                className={s.groupHeader}
                onClick={() => setIsOpen(v => !v)}
                aria-expanded={isOpen}
                type="button"
            >
                <span className={s.groupTitle}>{title}</span>
                <svg
                    className={`${s.arrow} ${isOpen ? s.arrowOpen : ''}`}
                    width="12"
                    height="7"
                    viewBox="0 0 12 7"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
            {isOpen && (
                <div className={s.groupOptions}>
                    {options.map(option => (
                        <button
                            key={option}
                            type="button"
                            className={`${s.optionPill} ${selected.includes(option) ? s.optionPillActive : ''}`}
                            onClick={() => onChange(option)}
                        >
                            {selected.includes(option) && (
                                <svg className={s.checkIcon} width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            )}
                            {option}
                        </button>
                    ))}
                </div>
            )}
            <div className={s.divider} />
        </div>
    );
}

interface FilterSidebarProps {
    onApply?: (filters: FilterState) => void;
    onClose?: () => void;
}

export default function FilterSidebar({ onApply, onClose }: FilterSidebarProps) {
    const [filters, setFilters] = useState<FilterState>({
        priceFrom: MIN_PRICE,
        priceTo: MAX_PRICE,
        meatPart: [],
        meatType: [],
        aging: [],
        marbling: [],
        country: [],
        breed: [],
    });

    const toggleOption = useCallback((key: keyof FilterState, value: string) => {
        setFilters(prev => {
            const arr = prev[key] as string[];
            return {
                ...prev,
                [key]: arr.includes(value)
                    ? arr.filter(v => v !== value)
                    : [...arr, value],
            };
        });
    }, []);

    const selectedCount =
        filters.meatPart.length +
        filters.meatType.length +
        filters.aging.length +
        filters.marbling.length +
        filters.country.length +
        filters.breed.length;

    const handleClear = () => {
        setFilters({
            priceFrom: MIN_PRICE,
            priceTo: MAX_PRICE,
            meatPart: [],
            meatType: [],
            aging: [],
            marbling: [],
            country: [],
            breed: [],
        });
    };

    const handleApply = () => {
        onApply?.(filters);
        onClose?.();
    };

    // Price range percent for slider track fill
    const fromPercent = ((filters.priceFrom - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;
    const toPercent = ((filters.priceTo - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;

    return (
        <div className={s.sidebar}>
            <div className={s.priceSection}>
                <div className={s.priceSectionHeader}>
                    <span className={s.groupTitle}>ЦІНА (ГРН)</span>
                    {selectedCount > 0 && (
                        <button type="button" className={s.clearBtn} onClick={handleClear}>
                            Очистити
                        </button>
                    )}
                </div>

                <div className={s.sliderWrap}>
                    <div className={s.sliderTrack}>
                        <div
                            className={s.sliderFill}
                            style={{
                                left: `${fromPercent}%`,
                                width: `${toPercent - fromPercent}%`,
                            }}
                        />
                        <input
                            type="range"
                            min={MIN_PRICE}
                            max={MAX_PRICE}
                            step={50}
                            value={filters.priceFrom}
                            className={s.rangeInput}
                            onChange={e => {
                                const val = Math.min(Number(e.target.value), filters.priceTo - 50);
                                setFilters(prev => ({ ...prev, priceFrom: val }));
                            }}
                        />
                        <input
                            type="range"
                            min={MIN_PRICE}
                            max={MAX_PRICE}
                            step={50}
                            value={filters.priceTo}
                            className={s.rangeInput}
                            onChange={e => {
                                const val = Math.max(Number(e.target.value), filters.priceFrom + 50);
                                setFilters(prev => ({ ...prev, priceTo: val }));
                            }}
                        />
                    </div>
                </div>

                <div className={s.priceInputs}>
                    <div className={s.priceInputWrap}>
                        <label className={s.priceLabel}>Від</label>
                        <input
                            type="number"
                            className={s.priceInput}
                            value={filters.priceFrom}
                            min={MIN_PRICE}
                            max={filters.priceTo - 50}
                            onChange={e =>
                                setFilters(prev => ({
                                    ...prev,
                                    priceFrom: Math.min(Number(e.target.value), prev.priceTo - 50),
                                }))
                            }
                        />
                    </div>
                    <div className={s.priceInputWrap}>
                        <label className={s.priceLabel}>До</label>
                        <input
                            type="number"
                            className={s.priceInput}
                            value={filters.priceTo}
                            min={filters.priceFrom + 50}
                            max={MAX_PRICE}
                            onChange={e =>
                                setFilters(prev => ({
                                    ...prev,
                                    priceTo: Math.max(Number(e.target.value), prev.priceFrom + 50),
                                }))
                            }
                        />
                    </div>
                    <button type="button" className={s.okBtn}>ок</button>
                </div>
                <div className={s.divider} />
            </div>

            <FilterGroup
                title="М'ЯСНА ЧАСТИНА"
                options={MEAT_PARTS}
                selected={filters.meatPart}
                onChange={v => toggleOption('meatPart', v)}
            />
            <FilterGroup
                title="ТИП М'ЯСА"
                options={MEAT_TYPES}
                selected={filters.meatType}
                onChange={v => toggleOption('meatType', v)}
            />
            <FilterGroup
                title="ВИТРИМКА"
                options={AGING_OPTIONS}
                selected={filters.aging}
                onChange={v => toggleOption('aging', v)}
            />
            <FilterGroup
                title="МАРМУРОВІСТЬ"
                options={MARBLING_OPTIONS}
                selected={filters.marbling}
                onChange={v => toggleOption('marbling', v)}
            />
            <FilterGroup
                title="КРАЇНА ПОХОДЖЕННЯ"
                options={COUNTRY_OPTIONS}
                selected={filters.country}
                onChange={v => toggleOption('country', v)}
            />
            <FilterGroup
                title="ПОРОДА"
                options={BREED_OPTIONS}
                selected={filters.breed}
                onChange={v => toggleOption('breed', v)}
            />

            <div className={s.actions}>
                <button
                    type="button"
                    className={s.applyBtn}
                    onClick={handleApply}
                >
                    {selectedCount > 0
                        ? `ЗАСТОСУВАТИ (${selectedCount})`
                        : 'ЗАСТОСУВАТИ ФІЛЬТР'}
                </button>
                {onClose && (
                    <button type="button" className={s.showMoreBtn} onClick={onClose}>
                        показать еще
                        <svg width="8" height="13" viewBox="0 0 8 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1L7 6.5L1 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}
