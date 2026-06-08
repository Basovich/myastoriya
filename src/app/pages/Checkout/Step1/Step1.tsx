'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import s from './Step1.module.scss';
import InputField from '@/app/components/ui/InputField/index';
import { GraphQLError } from '@/lib/graphql/client';
import Button from '@/app/components/ui/Button/Button';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/authSlice';
import { getAccessToken } from '@/app/actions/authActions';
import { sendSmsApi, smsVerifyApi, updateCheckoutUserDataApi } from '@/lib/graphql/queries/auth';
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
import { useRouter, useParams } from 'next/navigation';
import CartModal from '@/app/components/CartModal/CartModal';
import { useIsHydrated } from '@/hooks/useIsHydrated';



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
    const hydrated = useIsHydrated();
    const params = useParams();
    const locale = params?.lang as string;
    const { user, isAuthenticated, isGuest } = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch();
    const [smsToken, setSmsToken] = useState('');
    const [smsSending, setSmsSending] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitAttempted, setSubmitAttempted] = useState(false);
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
            } else {
                // Restoring user data if user is present, otherwise just updating the checkbox state
                setFormData(prev => ({
                    ...prev,
                    [field]: false,
                    ...(user ? {
                        firstName: user.name?.split(' ')[0] || '',
                        lastName: user.name?.split(' ').slice(1).join(' ') || '',
                        phone: (user.phone || '').replace(/\D/g, ''),
                        email: user.email || '',
                    } : {})
                }));
                if (user && user.phone) {
                    setPhoneVerified(true);
                }
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
        setSubmitAttempted(false);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const { formatted: phoneFormatted, handleChange: handlePhoneChange, handleFocus: handlePhoneFocus } = usePhoneMask(
        formData.phone,
        handlePhoneRawChange,
    );

    const handleBlur = (field: keyof Touched) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const validate = (forceVerifyCheck = false): FormErrors => {
        const errors: FormErrors = {};
        if (!formData.firstName.trim()) errors.firstName = "Обов'язкове поле";
        if (!formData.lastName.trim()) errors.lastName = "Обов'язкове поле";
        if (!formData.phone.trim()) {
            errors.phone = "Обов'язкове поле";
        } else if (formData.phone.length < 12) {
            errors.phone = "Некоректний номер телефону";
        } else if ((submitAttempted || forceVerifyCheck) && !phoneVerified) {
            errors.phone = "Підтвердіть номер телефону через SMS";
        }
        if (!formData.agreed) errors.agreed = 'Потрібна згода';
        return errors;
    };

    const errors = validate();

    const handleSendSms = async () => {
        if (!formData.phone.trim() || formData.phone.length < 12) {
            setTouched(prev => ({ ...prev, phone: true }));
            return;
        }
        
        setSmsError('');
        setSmsSending(true);
        try {
            const result = await sendSmsApi(formData.phone, locale);
            setSmsToken(result.token);
            
            if (result.code) {
                console.info('[SMS DEV] Code:', result.code);
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
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Помилка відправки SMS';
            setSmsError(msg);
        } finally {
            setSmsSending(false);
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
            await smsVerifyApi(smsToken, formData.smsCode.trim(), locale);
            setPhoneVerified(true);
            setSmsRequested(false);
            setCodeSent(false);
            setCountdown(0);
            if (timerRef.current) clearInterval(timerRef.current);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Невірний код. Спробуйте ще раз.';
            setSmsError(msg);
            handleChange('smsCode', '');
        } finally {
            setSmsVerifying(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitAttempted(true);
        const allTouched: Touched = {
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            smsCode: true,
            agreed: true,
        };
        setTouched(allTouched);
        
        const freshErrors = validate(true);
        if (Object.keys(freshErrors).length > 0) return;

        setIsSubmitting(true);
        setSubmitError('');
        try {
            const token = await getAccessToken();
            await updateCheckoutUserDataApi(
                {
                    name: formData.firstName,
                    surname: formData.lastName,
                    phone: formData.phone,
                    email: formData.email || undefined,
                },
                token || '',
                locale
            );

            if (isAuthenticated) {
                dispatch(setUser({
                    ...user,
                    name: formData.firstName,
                    surname: formData.lastName,
                    phone: formData.phone,
                    email: formData.email || undefined,
                }));
            }

            // Navigate to step 2
            const url = new URL(window.location.href);
            url.searchParams.set('step', '2');
            window.history.pushState({}, '', url.toString());
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error('Error updating checkout user data:', err);
            let msg = 'Помилка оновлення даних користувача';
            if (err instanceof GraphQLError && err.errors.length > 0) {
                const firstError = err.errors[0];
                const errorCode = firstError.extensions?.error_code;
                if (errorCode === 141 || errorCode === 25) {
                    msg = locale === 'ru'
                        ? 'Этот номер телефона уже зарегистрирован. Пожалуйста, войдите в свой аккаунт или воспользуйтесь другим номером.'
                        : 'Цей номер телефону вже зареєстрований. Будь ласка, увійдіть у свій акаунт або скористайтеся іншим номером.';
                } else if (err.message === 'Internal server error') {
                    msg = locale === 'ru'
                        ? 'Внутренняя ошибка сервера. Пожалуйста, попробуйте позже.'
                        : 'Внутрішня помилка сервера. Будь ласка, спробуйте пізніше.';
                } else {
                    msg = err.message;
                }
            } else if (err instanceof Error) {
                if (err.message === 'Internal server error') {
                    msg = locale === 'ru'
                        ? 'Внутренняя ошибка сервера. Пожалуйста, попробуйте позже.'
                        : 'Внутрішня помилка сервера. Будь ласка, спробуйте пізніше.';
                } else {
                    msg = err.message;
                }
            }
            setSubmitError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={s.layout}>
            {/* ── Left: Form ── */}
            <div className={s.formCard}>
                <StepIndicator current={1} />

                {hydrated && !isAuthenticated && (
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
                                    handlePhoneFocus();
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
                                    disabled={(countdown > 0 && !smsRequested) || smsVerifying || smsSending}
                                >
                                    {smsSending
                                        ? 'Надсилання...'
                                        : smsVerifying
                                            ? 'Перевірка...'
                                            : smsRequested
                                                ? 'Підтвердити код'
                                                : 'Отримати код'
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

                        {hydrated && isAuthenticated && !isGuest && user && (
                            <Checkbox
                                id="checkout-another-recipient"
                                checked={formData.anotherRecipient}
                                onChange={val => handleChange('anotherRecipient', val)}
                            >
                                Додати іншого отримувача
                            </Checkbox>
                        )}
                    </div>

                    {submitError && (
                        <div className={s.fieldError} style={{ marginBottom: '16px' }}>{submitError}</div>
                    )}
                    <Button
                        type="submit"
                        variant="red"
                        id="checkout-next-btn"
                        className={s.submitBtn}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'ЗАЧЕКАЙТЕ...' : 'ДАЛІ'}
                    </Button>
                </form>
            </div>

            {/* ── Right: Sidebar ── */}
            <div className={s.sidebar}>
                <CartSummary 
                    onEditCart={() => setIsCartModalOpen(true)} 
                    discountPercent={appliedPromo?.discount || 0}
                />
                {hydrated && (
                    <PromoBlock 
                        onApply={(code, discount) => setAppliedPromo({ code, discount })} 
                        isApplied={!!appliedPromo}
                    />
                )}
                
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
