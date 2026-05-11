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
            {showDelete && onDelete && (
                <button 
                    className={s.deleteBtn}
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(card.id);
                    }}
                    aria-label="Delete"
                >
                    <Image 
                        src="/icons/icon-trash.svg" 
                        alt="Delete" 
                        width={12} 
                        height={14} 
                    />
                </button>
            )}
            
            <div className={s.cardContent}>
                <div className={s.field}>
                    <div className={s.label}>{d.cardNumber}</div>
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
