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
            <div className={s.top}>
                <div className={s.balanceInfo}>
                    <div className={s.amount}>{balance} Б</div>
                    <div className={s.label}>{dict.balanceLabel}</div>
                </div>
                <div className={s.logo}>
                    <Image 
                        src="/images/logo-white.svg" 
                        alt="Myastoriya" 
                        width={40} 
                        height={40} 
                        className={s.logoIcon}
                    />
                </div>
            </div>

            <div className={s.middle}>
                <div className={s.cashbackBadge}>
                    <span className={s.percent}>+{percent}%</span>
                    <span className={s.desc}>{dict.orderPercent}</span>
                </div>
                <div className={s.cashbackLabel}>{dict.cashbackLabel}</div>
            </div>

            <div className={s.bottom}>
                <div className={s.rate}>{dict.exchangeRate}</div>
                <button type="button" className={s.howToUse}>
                    {dict.howToUse}
                </button>
            </div>
            
            {/* Background elements if any, or just gradient */}
            <div className={s.decoration} />
        </div>
    );
}
