'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import s from './PromoBlock.module.scss';
import clsx from 'clsx';
import { applyPromoCodeApi } from '@/lib/graphql/queries/cart';

interface PromoBlockProps {
    onApply: (code: string, discount: number) => void;
    isApplied: boolean;
}

export default function PromoBlock({ onApply, isApplied }: PromoBlockProps) {
    const params = useParams();
    const locale = params?.lang as string;
    const [isEditing, setIsEditing] = useState(false);
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!code.trim()) {
            setError("Обов'язкове поле");
            return;
        }

        setIsLoading(true);
        try {
            const lang = locale === 'ru' ? 'ru' : 'ua';
            const cart = await applyPromoCodeApi({ code: code.trim() }, undefined, lang);

            if (cart.promoCode?.isApplied) {
                setIsEditing(false);
                const discountStr = cart.promoCode.discount || '0';
                const discountVal = parseFloat(discountStr.replace(/[^\d.]/g, '')) || 0;
                onApply(code.trim(), discountVal);
            } else {
                setError(lang === 'ru' ? 'Не удалось применить промокод' : 'Не вдалося застосувати промокод');
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Помилка зв\'язку з сервером';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    if (isApplied) {
        return (
            <div className={clsx(s.promoBlock, s.applied)}>
                <div className={s.successMsg}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="9" cy="9" r="9" fill="#2A9D5C" />
                        <path d="M5 9L8 12L13 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Промокод / сертифікат застосовано</span>
                </div>
            </div>
        );
    }

    if (isEditing) {
        return (
            <div className={s.promoBlock}>
                <form className={s.promoForm} onSubmit={handleVerify}>
                    <div className={clsx(s.inputWrapper, error && s.inputError)}>
                        <input
                            type="text"
                            placeholder="Введіть промокод / сертифікат"
                            value={code}
                            onChange={(e) => {
                                setCode(e.target.value);
                                if (error) setError('');
                            }}
                            className={s.promoInput}
                            autoFocus
                        />
                        <button type="submit" className={s.confirmBtn} disabled={isLoading}>
                            {isLoading ? '...' : 'ПІДТВЕРДИТИ'}
                        </button>
                    </div>
                    {error && <span className={s.errorText}>{error}</span>}
                </form>
            </div>
        );
    }

    return (
        <div className={s.promoBlock}>
            <button 
                className={s.promoBtn} 
                id="promo-code-btn" 
                type="button"
                onClick={() => setIsEditing(true)}
            >
                ДОДАТИ ПРОМОКОД / СЕРТИФІКАТ
            </button>
        </div>
    );
}
