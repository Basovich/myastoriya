'use client';

import React, { useMemo } from 'react';
import s from './PriceRange.module.scss';

interface PriceRangeProps {
    min: number;
    max: number;
    from: number;
    to: number;
    step?: number;
    onChange: (from: number, to: number) => void;
    label?: string;
    onClear?: () => void;
    showClear?: boolean;
}

export default function PriceRange({
    min,
    max,
    from,
    to,
    step = 1,
    onChange,
    label,
    onClear,
    showClear,
}: PriceRangeProps) {
    const fromPercent = useMemo(() => ((from - min) / (max - min)) * 100, [from, min, max]);
    const toPercent = useMemo(() => ((to - min) / (max - min)) * 100, [to, min, max]);

    const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Math.min(Number(e.target.value), to - (step || 1));
        onChange(val, to);
    };

    const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Math.max(Number(e.target.value), from + (step || 1));
        onChange(from, val);
    };

    return (
        <div className={s.priceSection}>
            {(label || showClear) && (
                <div className={s.priceSectionHeader}>
                    {label && <span className={s.groupTitle}>{label}</span>}
                    {showClear && onClear && (
                        <button type="button" className={s.clearBtn} onClick={onClear}>
                            Очистити
                        </button>
                    )}
                </div>
            )}

            <div className={s.priceInputs}>
                <div className={s.priceInputWrap}>
                    <span className={s.priceLabel}>От</span>
                    <input
                        type="number"
                        className={s.priceInput}
                        value={from}
                        min={min}
                        max={to - step}
                        onChange={handleFromChange}
                    />
                </div>
                <div className={s.priceInputWrap}>
                    <span className={s.priceLabel}>До</span>
                    <input
                        type="number"
                        className={s.priceInput}
                        value={to}
                        min={from + step}
                        max={max}
                        onChange={handleToChange}
                    />
                </div>
                <button type="button" className={s.okBtn}>OK</button>
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
                        min={min}
                        max={max}
                        step={step}
                        value={from}
                        className={s.rangeInput}
                        onChange={handleFromChange}
                    />
                    <input
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={to}
                        className={s.rangeInput}
                        onChange={handleToChange}
                    />
                </div>
            </div>
        </div>
    );
}
