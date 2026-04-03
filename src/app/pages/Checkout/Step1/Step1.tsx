'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import s from './Step1.module.scss';
import InputField from '@/app/components/ui/InputField/index';
import Button from '@/app/components/ui/Button/Button';
import { useAppSelector } from '@/store/hooks';
import { MOCK_PRODUCTS, FALLBACK_PRODUCT } from '@/app/components/CartModal/products_mock';
import { useMemo } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import { usePhoneMask } from '@/hooks/usePhoneMask';
import AuthModal from '@/app/components/AuthModal';
import Checkbox from '@/app/components/ui/Checkbox/Checkbox';
import StepIndicator from '../components/StepIndicator';
import CartSummary from '../components/CartSummary';
import PromoBlock from '../components/PromoBlock/Index';
import { useRouter } from 'next/navigation';
import CartModal from '@/app/components/CartModal/CartModal';



// ── Main Step1 Component ──────────────────────────────────────────────────────

interface FormData {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    smsCode: string;
    agreed: boolean;
    anotherRecipient: boolean;
}

interface FormErrors {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    smsCode?: string;
    agreed?: string;
}

interface Touched {
    firstName?: boolean;
    lastName?: boolean;
    phone?: boolean;
    email?: boolean;
    smsCode?: boolean;
    agreed?: boolean;
}

export default function Step1() {
    const { user, isAuthenticated } = useAppSelector(state => state.auth);
    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        smsCode: '',
        agreed: true,
        anotherRecipient: false,
    });

    const [touched, setTouched] = useState<Touched>({});
    const [codeSent, setCodeSent] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Promo functionality
    const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem('applied_promo');
        if (saved) {
            try {
                const val = JSON.parse(saved);
                if (val && val.code && typeof val.discount === 'number') {
                    setAppliedPromo(val);
                }
            } catch (e) {
                console.error('Error parsing saved promo', e);
            }
        }
    }, []);

    useEffect(() => {
        if (appliedPromo) {
            localStorage.setItem('applied_promo', JSON.stringify(appliedPromo));
        } else {
            localStorage.removeItem('applied_promo');
        }
    }, [appliedPromo]);
    
    // Cart modal functionality
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);
    const cartItems = useAppSelector(state => state.cart.items);
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated && user && !formData.anotherRecipient) {
            setFormData(prev => ({
                ...prev,
                firstName: user.name?.split(' ')[0] || '',
                lastName: user.name?.split(' ').slice(1).join(' ') || '',
                phone: (user.phone || '').replace(/\D/g, ''),
                email: user.email || '',
            }));
            if (user.phone) {
                setPhoneVerified(true);
            }
        }
    }, [isAuthenticated, user, formData.anotherRecipient]);

    const handleCloseCartModal = () => {
        setIsCartModalOpen(false);
        // If user deleted all items and closed cart, redirect to main page
        if (cartItems.length === 0) {
            router.push('/');
        }
    };

    const handleChange = (field: keyof FormData, value: string | boolean) => {
        if (field === 'anotherRecipient' && typeof value === 'boolean') {
            if (value) {
                // Clearing for another recipient
                setFormData(prev => ({
                    ...prev,
                    [field]: true,
                    firstName: '',
                    lastName: '',
                    phone: '',
                    email: '',
                }));
                setPhoneVerified(false);
            } else if (user) {
                // Restoring user data
                setFormData(prev => ({
                    ...prev,
                    [field]: false,
                    firstName: user.name?.split(' ')[0] || '',
                    lastName: user.name?.split(' ').slice(1).join(' ') || '',
                    phone: (user.phone || '').replace(/\D/g, ''),
                    email: user.email || '',
                }));
                if (user.phone) setPhoneVerified(true);
            }
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const [phoneVerified, setPhoneVerified] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [smsRequested, setSmsRequested] = useState(false);
    const [smsVerifying, setSmsVerifying] = useState(false);
    const [smsError, setSmsError] = useState('');

    const handlePhoneRawChange = (raw: string) => {
        handleChange('phone', raw);
        setPhoneVerified(false);
        setSmsRequested(false);
        setCodeSent(false);
        setCountdown(0);
        setSmsError('');
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const { formatted: phoneFormatted, handleChange: handlePhoneChange } = usePhoneMask(
        formData.phone,
        handlePhoneRawChange,
    );

    const handleBlur = (field: keyof Touched) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const validate = (): FormErrors => {
        const errors: FormErrors = {};
        if (!formData.firstName.trim()) errors.firstName = "Обов'язкове поле";
        if (!formData.lastName.trim()) errors.lastName = "Обов'язкове поле";
        if (!formData.phone.trim()) errors.phone = "Обов'язкове поле";
        if (!formData.agreed) errors.agreed = 'Потрібна згода';
        return errors;
    };

    const errors = validate();

    const handleSendSms = async () => {
        if (!formData.phone.trim()) {
            setTouched(prev => ({ ...prev, phone: true }));
            return;
        }
        
        setSmsError('');
        try {
            const res = await fetch('/api/send-sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: formData.phone }),
            });
            const data = await res.json();
            
            if (!res.ok) {
                setSmsError(data.error || 'Помилка відправки SMS');
                return;
            }
            
            setSmsRequested(true);
            setCodeSent(true);
            setCountdown(60);
            handleChange('smsCode', '');
            
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current!);
                        setSmsRequested(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch {
            setSmsError('Помилка мережі. Спробуйте ще раз.');
        }
    };

    const handleVerifySms = async () => {
        if (!formData.smsCode.trim()) {
            setSmsError('Введіть код з SMS');
            return;
        }
        
        setSmsVerifying(true);
        setSmsError('');
        
        try {
            const res = await fetch('/api/verify-sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: formData.phone, code: formData.smsCode.trim() }),
            });
            const data = await res.json();
            
            if (data.valid) {
                setPhoneVerified(true);
                setSmsRequested(false);
                setCodeSent(false);
                setCountdown(0);
                if (timerRef.current) clearInterval(timerRef.current);
            } else {
                setSmsError(data.error || 'Невірний код. Спробуйте ще раз.');
                handleChange('smsCode', '');
            }
        } catch {
            setSmsError('Помилка мережі. Спробуйте ще раз.');
        } finally {
            setSmsVerifying(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const allTouched: Touched = {
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            smsCode: true,
            agreed: true,
        };
        setTouched(allTouched);
        if (Object.keys(errors).length > 0) return;
        // Navigate to step 2
        const url = new URL(window.location.href);
        url.searchParams.set('step', '2');
        window.history.pushState({}, '', url.toString());
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className={s.layout}>
            {/* ── Left: Form ── */}
            <div className={s.formCard}>
                <StepIndicator current={1} />

                {!isAuthenticated && (
                    <button
                        className={s.hasAccountBtn}
                        id="has-account-btn"
                        type="button"
                        onClick={() => setIsAuthModalOpen(true)}
                    >
                        У ВАС Є АККАУНТ?
                    </button>
                )}

                <form className={s.form} onSubmit={handleSubmit} noValidate>
                    <div className={s.formRow}>
                        <InputField
                            id="checkout-first-name"
                            label="Ім'я"
                            required
                            value={formData.firstName}
                            onChange={e => handleChange('firstName', e.target.value)}
                            onBlur={() => handleBlur('firstName')}
                            error={errors.firstName}
                            touched={touched.firstName}
                            className={s.checkoutInput}
                        />
                        <InputField
                            id="checkout-last-name"
                            label="Прізвище"
                            required
                            value={formData.lastName}
                            onChange={e => handleChange('lastName', e.target.value)}
                            onBlur={() => handleBlur('lastName')}
                            error={errors.lastName}
                            touched={touched.lastName}
                            className={s.checkoutInput}
                        />
                    </div>

                    <div className={s.formRow}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
                            <InputField
                                id="checkout-phone"
                                label="Телефон"
                                required
                                type="tel"
                                autoComplete="off"
                                readOnly
                                onFocus={(e) => {
                                    e.currentTarget.removeAttribute('readonly');
                                }}
                                value={phoneFormatted}
                                onChange={handlePhoneChange}
                                onBlur={() => handleBlur('phone')}
                                error={!phoneVerified ? errors.phone : undefined}
                                touched={touched.phone}
                                className={clsx(s.checkoutInput, phoneVerified && s.inputVerified)}
                            />
                            {phoneVerified && (
                                <span className={s.verifiedBadge}>
                                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                                        <circle cx="6.5" cy="6.5" r="6.5" fill="#2a9d5c" />
                                        <path d="M3.5 6.5L5.5 8.5L9.5 4.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Телефон підтверджено
                                </span>
                            )}
                        </div>
                        <InputField
                            id="checkout-email"
                            label="E-mail"
                            type="email"
                            value={formData.email}
                            onChange={e => handleChange('email', e.target.value)}
                            onBlur={() => handleBlur('email')}
                            className={s.checkoutInput}
                        />
                    </div>

                    {formData.phone.trim().length > 0 && !phoneVerified && (
                        <div className={s.smsRow}>
                            <InputField
                                id="checkout-sms-code"
                                label="Введіть код з СМС"
                                value={formData.smsCode}
                                onChange={e => handleChange('smsCode', e.target.value)}
                                onBlur={() => handleBlur('smsCode')}
                                className={clsx(s.checkoutInput, s.smsInput)}
                                disabled={!smsRequested}
                            />
                            <div className={s.smsActionCol}>
                                {smsError ? (
                                    <span className={s.fieldError}>{smsError}</span>
                                ) : codeSent ? (
                                    <p className={s.resendHint}>
                                        Відправити повторно код можна буде через:{' '}
                                        <span className={s.resendCountdown}>{countdown}</span>
                                    </p>
                                ) : (
                                    <div className={s.resendHintPlaceholder} />
                                )}
                                <button
                                    type="button"
                                    id="send-sms-code-btn"
                                    className={s.sendCodeBtn}
                                    onClick={smsRequested ? handleVerifySms : handleSendSms}
                                    disabled={(countdown > 0 && !smsRequested) || smsVerifying}
                                >
                                    {smsVerifying
                                        ? 'Перевірка...'
                                        : smsRequested
                                            ? 'Підтвердити код'
                                            : 'Відправити код'
                                    }
                                </button>
                            </div>
                        </div>
                    )}

                    <div className={s.divider} />

                    <div className={s.checkboxRow}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <Checkbox
                                id="checkout-agree"
                                checked={formData.agreed}
                                onChange={val => {
                                    handleChange('agreed', val);
                                    if (!val) setTouched(prev => ({ ...prev, agreed: true }));
                                }}
                            >
                                Я згоден з{' '}
                                <Link
                                    href="/oferta"
                                    className={s.inlineLink}
                                    target="_blank"
                                    onClick={e => e.stopPropagation()}
                                >
                                    угодою користувача
                                </Link>
                            </Checkbox>
                            {touched.agreed && errors.agreed && (
                                <span className={s.fieldError} style={{ marginLeft: '28px' }}>{errors.agreed}</span>
                            )}
                        </div>

                        {isAuthenticated && (
                            <Checkbox
                                id="checkout-another-recipient"
                                checked={formData.anotherRecipient}
                                onChange={val => handleChange('anotherRecipient', val)}
                            >
                                Додати іншого отримувача
                            </Checkbox>
                        )}
                    </div>

                    <Button
                        type="submit"
                        variant="red"
                        id="checkout-next-btn"
                        className={s.submitBtn}
                    >
                        ДАЛІ
                    </Button>
                </form>
            </div>

            {/* ── Right: Sidebar ── */}
            <div className={s.sidebar}>
                <CartSummary 
                    onEditCart={() => setIsCartModalOpen(true)} 
                    discountPercent={appliedPromo?.discount || 0}
                />
                <PromoBlock 
                    onApply={(code, discount) => setAppliedPromo({ code, discount })} 
                    isApplied={!!appliedPromo}
                />
                
                <p className={s.packageNote}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="7" cy="7" r="6.5" stroke="#E3051B" />
                        <path d="M7 4V7.5" stroke="#E3051B" strokeWidth="1.2" strokeLinecap="round" />
                        <circle cx="7" cy="9.5" r="0.6" fill="#E3051B" />
                    </svg>
                    До загальної суми замовлення не входить вартість пакету
                </p>
            </div>
            
            {/* ── Cart Modal ── */}
            <CartModal 
                isOpen={isCartModalOpen} 
                onClose={handleCloseCartModal} 
                isCheckoutMode={true}
            />
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </div>
    );
}
