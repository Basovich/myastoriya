'use client';

import React, { useState } from 'react';
import s from './PromoBlock.module.scss';
import clsx from 'clsx';

interface PromoBlockProps {
    onApply: (code: string, discount: number) => void;
    isApplied: boolean;
}

export default function PromoBlock({ onApply, isApplied }: PromoBlockProps) {
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
            const res = await fetch('/api/promo/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code.trim() }),
            });
            const data = await res.json();

            if (res.ok && data.valid) {
                setIsEditing(false);
                onApply(code.trim(), data.discount);
            } else {
                setError(data.error || 'Невірний код');
            }
        } catch (err) {
            setError('Помилка звязку з сервером');
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
