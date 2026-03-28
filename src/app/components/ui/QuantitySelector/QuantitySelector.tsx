import React from 'react';
import s from './QuantitySelector.module.scss';
import clsx from 'clsx';

interface QuantitySelectorProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    className?: string;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({ 
    value, 
    onChange, 
    min = 1, 
    max = 99, 
    className 
}) => {
    const handleDecrement = () => {
        if (value > min) {
            onChange(value - 1);
        }
    };

    const handleIncrement = () => {
        if (value < max) {
            onChange(value + 1);
        }
    };

    return (
        <div className={clsx(s.selector, className)}>
            <button 
                className={s.btn} 
                onClick={handleDecrement}
                disabled={value <= min}
                aria-label="Decrease quantity"
            >
                <svg width="12" height="2" viewBox="0 0 12 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
            </button>
            <span className={s.value}>{value}</span>
            <button 
                className={s.btn} 
                onClick={handleIncrement}
                disabled={value >= max}
                aria-label="Increase quantity"
            >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
            </button>
        </div>
    );
};

export default QuantitySelector;
