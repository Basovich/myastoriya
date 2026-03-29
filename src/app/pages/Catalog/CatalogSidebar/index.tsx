'use client';

import { useState, useCallback } from 'react';
import s from './FilterSidebar.module.scss';
import FilterGroup from '@/app/components/ui/FilterGroup/FilterGroup';
import FilterCheckbox from '@/app/components/ui/FilterCheckbox/FilterCheckbox';
import FilterPill from '@/app/components/ui/FilterPill/FilterPill';
import PriceRange from '@/app/components/ui/PriceRange/PriceRange';
import ShowMoreButton from '@/app/components/ui/ShowMoreButton/ShowMoreButton';

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

interface CatalogSidebarProps {
    onApply?: (filters: FilterState) => void;
    onClose?: () => void;
}

export default function CatalogSidebar({ onApply, onClose }: CatalogSidebarProps) {
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

    type FilterArrayKeys = { [K in keyof FilterState]: FilterState[K] extends string[] ? K : never }[keyof FilterState];

    const toggleOption = useCallback((key: FilterArrayKeys, value: string) => {
        setFilters(prev => {
            const arr = prev[key];
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

    return (
        <div className={s.sidebar}>
            <div className={s.filtersWrapper}>
                <PriceRange
                    min={MIN_PRICE}
                    max={MAX_PRICE}
                    from={filters.priceFrom}
                    to={filters.priceTo}
                    step={50}
                    onChange={(from, to) => setFilters(prev => ({ ...prev, priceFrom: from, priceTo: to }))}
                    label="ЦІНА (ГРН)"
                    onClear={handleClear}
                    showClear={selectedCount > 0}
                />

                <FilterGroup title="М'ЯСНА ЧАСТИНА">
                    {MEAT_PARTS.map(option => (
                        <FilterPill
                            key={option}
                            active={filters.meatPart.includes(option)}
                            onClick={() => toggleOption('meatPart', option)}
                        >
                            {option}
                        </FilterPill>
                    ))}
                </FilterGroup>

                <FilterGroup title="ТИП М'ЯСА">
                    {MEAT_TYPES.map(option => (
                        <FilterCheckbox
                            key={option}
                            active={filters.meatType.includes(option)}
                            onClick={() => toggleOption('meatType', option)}
                        >
                            {option}
                        </FilterCheckbox>
                    ))}
                </FilterGroup>

                <FilterGroup title="ВИТРИМКА">
                    {AGING_OPTIONS.map(option => (
                        <FilterPill
                            key={option}
                            active={filters.aging.includes(option)}
                            onClick={() => toggleOption('aging', option)}
                        >
                            {option}
                        </FilterPill>
                    ))}
                </FilterGroup>

                <FilterGroup title="МАРМУРОВІСТЬ">
                    {MARBLING_OPTIONS.map(option => (
                        <FilterPill
                            key={option}
                            active={filters.marbling.includes(option)}
                            onClick={() => toggleOption('marbling', option)}
                        >
                            {option}
                        </FilterPill>
                    ))}
                </FilterGroup>

                <FilterGroup title="КРАЇНА ПОХОДЖЕННЯ">
                    {COUNTRY_OPTIONS.map(option => (
                        <FilterPill
                            key={option}
                            active={filters.country.includes(option)}
                            onClick={() => toggleOption('country', option)}
                        >
                            {option}
                        </FilterPill>
                    ))}
                </FilterGroup>

                <FilterGroup title="ПОРОДА">
                    {BREED_OPTIONS.map(option => (
                        <FilterPill
                            key={option}
                            active={filters.breed.includes(option)}
                            onClick={() => toggleOption('breed', option)}
                        >
                            {option}
                        </FilterPill>
                    ))}
                </FilterGroup>
            </div>

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
                    <ShowMoreButton
                        fullWidth
                        onClick={onClose}
                        label="ЗАКРИТИ"
                    />
                )}
            </div>
        </div>
    );
}
