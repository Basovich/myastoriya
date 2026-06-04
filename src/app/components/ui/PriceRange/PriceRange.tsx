'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Range } from 'react-range';
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
    onOk?: () => void;
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
    onOk,
}: PriceRangeProps) {
    const [fromInput, setFromInput] = useState(String(from));
    const [toInput, setToInput] = useState(String(to));

    useEffect(() => {
        setFromInput(String(from));
    }, [from]);

    useEffect(() => {
        setToInput(String(to));
    }, [to]);

    const fromPercent = useMemo(() => ((from - min) / (max - min)) * 100, [from, min, max]);
    const toPercent = useMemo(() => ((to - min) / (max - min)) * 100, [to, min, max]);


    const handleFromTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFromInput(e.target.value);
    };

    const handleToTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setToInput(e.target.value);
    };

    const commitFromValue = () => {
        let val = Number(fromInput);
        if (isNaN(val) || val < min) val = min;
        if (val > to) val = to;
        setFromInput(String(val));
        onChange(val, to);
    };

    const commitToValue = () => {
        let val = Number(toInput);
        if (isNaN(val) || val > max) val = max;
        if (val < from) val = from;
        setToInput(String(val));
        onChange(from, val);
    };

    const handleOkClick = () => {
        let finalFrom = Number(fromInput);
        if (isNaN(finalFrom) || finalFrom < min) finalFrom = min;
        if (finalFrom > to) finalFrom = to;

        let finalTo = Number(toInput);
        if (isNaN(finalTo) || finalTo > max) finalTo = max;
        if (finalTo < finalFrom) finalTo = finalFrom;

        setFromInput(String(finalFrom));
        setToInput(String(finalTo));
        onChange(finalFrom, finalTo);
        onOk?.();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleOkClick();
        }
    };

    const isFromNearRightHalf = from > (max - min) / 2;

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
                        value={fromInput}
                        min={min}
                        max={to}
                        onChange={handleFromTextChange}
                        onBlur={commitFromValue}
                        onKeyDown={handleKeyDown}
                    />
                </div>
                <div className={s.priceInputWrap}>
                    <span className={s.priceLabel}>До</span>
                    <input
                        type="number"
                        className={s.priceInput}
                        value={toInput}
                        min={from}
                        max={max}
                        onChange={handleToTextChange}
                        onBlur={commitToValue}
                        onKeyDown={handleKeyDown}
                    />
                </div>
                <button type="button" className={s.okBtn} onClick={handleOkClick}>OK</button>
            </div>

            <div className={s.sliderWrap}>
                <Range
                    step={step}
                    min={min}
                    max={max}
                    values={[from, to]}
                    onChange={(values) => {
                        // Clamp each handle independently against the other's CURRENT value
                        // to prevent any crossing or nudging.
                        const newFrom = Math.min(values[0], to);
                        const newTo = Math.max(values[1], from);
                        onChange(newFrom, newTo);
                    }}
                    renderTrack={({ props, children }) => {
                        const { key, ...restProps } = props as typeof props & { key: React.Key };
                        return (
                            <div
                                key={key}
                                {...restProps}
                                className={s.sliderTrack}
                                style={{
                                    ...restProps.style,
                                }}
                            >
                                <div
                                    className={s.sliderFill}
                                    style={{
                                        left: `${fromPercent}%`,
                                        width: `${toPercent - fromPercent}%`,
                                    }}
                                />
                                {children}
                                <div
                                    className={`${s.customThumb} ${isFromNearRightHalf ? s.highZ : ''}`}
                                    style={{ left: `${fromPercent}%` }}
                                />
                                <div
                                    className={`${s.customThumb} ${!isFromNearRightHalf ? s.highZ : ''}`}
                                    style={{ left: `${toPercent}%` }}
                                />
                            </div>
                        );
                    }}
                    renderThumb={({ props }) => {
                        const { key, ...restProps } = props as typeof props & { key: React.Key };
                        return (
                            <div
                                key={key}
                                {...restProps}
                                className={s.transparentThumb}
                                style={{
                                    ...restProps.style,
                                }}
                            />
                        );
                    }}
                />
            </div>
        </div>
    );
}
