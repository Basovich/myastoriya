import React from 'react';
import s from './BonusCard.module.scss';
import AppLink from '@/app/components/ui/AppLink/AppLink';

interface BonusCardProps {
    balance: number;
    percent: number;
    dict: {
        balanceLabel: string;
        cashbackLabel: string;
        exchangeRate: string;
        howToUse: string;
        orderPercent: string;
    };
    className?: string;
}

export default function BonusCard({ balance, percent, dict, className }: BonusCardProps) {
    return (
        <div className={`${s.bonusCard} ${className || ''}`}>
            <div className={s.leftCol}>
                <div className={s.balanceLabelRow}>
                    <svg className={s.starIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span className={s.label}>{dict.balanceLabel}</span>
                </div>
                <div className={s.amountRow}>
                    <span className={s.amount}>{balance}</span>
                    <span className={s.currency}>Б</span>
                </div>
                <div className={s.rate}>{dict.exchangeRate}</div>
            </div>

            <div className={s.rightCol}>
                <div className={s.cashbackLabel}>{dict.cashbackLabel}</div>
                <div className={s.cashbackBadge}>
                    <span className={s.percent}>+{percent}%</span>
                    <span className={s.desc}>{dict.orderPercent}</span>
                </div>
                <AppLink href="/loyalty-program-rules" className={s.howToUse}>
                    {dict.howToUse}
                </AppLink>
            </div>
        </div>
    );
}
