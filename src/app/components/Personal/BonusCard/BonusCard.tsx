import React from 'react';
import Image from 'next/image';
import s from './BonusCard.module.scss';

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
}

export default function BonusCard({ balance, percent, dict }: BonusCardProps) {
    return (
        <div className={s.bonusCard}>
            <div className={s.bgOverlay} />
            <div className={s.logo}>
                <Image 
                    src="/images/logo-white.svg" 
                    alt="Myastoriya" 
                    width={56} 
                    height={16} 
                    className={s.logoIcon}
                />
            </div>

            <div className={s.mainContent}>
                <div className={s.statsRow}>
                    <div className={s.balanceCol}>
                        <div className={s.label}>{dict.balanceLabel}</div>
                        <div className={s.amount}>{balance} Б</div>
                    </div>
                    <div className={s.cashbackCol}>
                        <div className={s.label}>{dict.cashbackLabel}</div>
                        <div className={s.badge}>
                            <span className={s.percent}>+{percent}%</span>
                            <span className={s.desc}>{dict.orderPercent}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={s.bottomRow}>
                <div className={s.rate}>{dict.exchangeRate}</div>
                <button type="button" className={s.howToUse}>
                    {dict.howToUse}
                </button>
            </div>
        </div>
    );
}
