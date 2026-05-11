'use client';

import React from 'react';
import clsx from 'clsx';
import s from './BankCardItem.module.scss';

interface AddBankCardBtnProps {
    onClick: () => void;
    lang: 'ua' | 'ru';
    className?: string;
}

const dict = {
    ua: {
        addCard: "Додати картку",
    },
    ru: {
        addCard: "Добавить карту",
    }
};

export default function AddBankCardBtn({ onClick, lang, className }: AddBankCardBtnProps) {
    const d = dict[lang];

    return (
        <button className={clsx(s.addCard, className)} onClick={onClick} type="button">
            <div className={s.plusCircle}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5V19M5 12H19" stroke="#999" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </div>
            <span>{d.addCard}</span>
        </button>
    );
}
