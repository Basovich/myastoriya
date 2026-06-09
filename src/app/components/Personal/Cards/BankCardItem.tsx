'use client';

import React from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import s from './BankCardItem.module.scss';

export interface BankCard {
    id: string;
    number: string;
    expiry: string;
    type: 'visa' | 'mastercard';
    isDefault?: boolean;
}

interface BankCardItemProps {
    card: BankCard;
    isSelected?: boolean;
    onSelect?: (id: string) => void;
    onDelete?: (id: string) => void;
    lang: 'ua' | 'ru';
    className?: string;
    showDelete?: boolean;
}

const dict = {
    ua: {
        cardNumber: "Номер картки",
        expiry: "Термін дії",
    },
    ru: {
        cardNumber: "Номер карты",
        expiry: "Срок действия",
    }
};

export default function BankCardItem({ 
    card, 
    isSelected, 
    onSelect, 
    onDelete, 
    lang, 
    className,
    showDelete = false
}: BankCardItemProps) {
    const d = dict[lang];

    return (
        <div 
            className={clsx(s.card, isSelected && s.selected, className)}
            onClick={() => onSelect?.(card.id)}
        >
            <div className={s.cardContent}>
                <div className={s.field}>
                    <div className={s.label}>
                        {d.cardNumber}
                        {showDelete && onDelete && (
                            <button
                                className={s.deleteBtn}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(card.id);
                                }}
                                aria-label="Delete"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="14" viewBox="0 0 12 14" fill="none">
                                    <path d="M11.3333 2.8H8.66667V2.1C8.66667 1.54305 8.45595 1.0089 8.08088 0.615076C7.70581 0.221249 7.1971 0 6.66667 0H5.33333C4.8029 0 4.29419 0.221249 3.91912 0.615076C3.54405 1.0089 3.33333 1.54305 3.33333 2.1V2.8H0.666667C0.489856 2.8 0.320286 2.87375 0.195262 3.00503C0.0702379 3.1363 0 3.31435 0 3.5C0 3.68565 0.0702379 3.8637 0.195262 3.99497C0.320286 4.12625 0.489856 4.2 0.666667 4.2H1.33333V11.9C1.33333 12.457 1.54405 12.9911 1.91912 13.3849C2.29419 13.7788 2.8029 14 3.33333 14H8.66667C9.1971 14 9.70581 13.7788 10.0809 13.3849C10.456 12.9911 10.6667 12.457 10.6667 11.9V4.2H11.3333C11.5101 4.2 11.6797 4.12625 11.8047 3.99497C11.9298 3.8637 12 3.68565 12 3.5C12 3.31435 11.9298 3.1363 11.8047 3.00503C11.6797 2.87375 11.5101 2.8 11.3333 2.8ZM4.66667 2.1C4.66667 1.91435 4.7369 1.7363 4.86193 1.60503C4.98695 1.47375 5.15652 1.4 5.33333 1.4H6.66667C6.84348 1.4 7.01305 1.47375 7.13807 1.60503C7.2631 1.7363 7.33333 1.91435 7.33333 2.1V2.8H4.66667V2.1ZM9.33333 11.9C9.33333 12.0857 9.2631 12.2637 9.13807 12.395C9.01305 12.5263 8.84348 12.6 8.66667 12.6H3.33333C3.15652 12.6 2.98695 12.5263 2.86193 12.395C2.7369 12.2637 2.66667 12.0857 2.66667 11.9V4.2H9.33333V11.9Z" />
                                </svg>
                            </button>
                        )}
                    </div>
                    <div className={s.value}>{card.number}</div>
                </div>
                
                <div className={s.bottomRow}>
                    <div className={s.field}>
                        <div className={s.label}>{d.expiry}</div>
                        <div className={s.expiry}>{card.expiry}</div>
                    </div>
                    <div className={s.cardLogo}>
                        <Image 
                            src={card.type === 'visa' ? '/icons/visa_logo_card.svg' : '/icons/MC.png'}
                            alt={card.type} 
                            width={card.type === 'visa' ? 44 : 32} 
                            height={card.type === 'visa' ? 28 : 26}
                            style={{ objectFit: 'contain' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
