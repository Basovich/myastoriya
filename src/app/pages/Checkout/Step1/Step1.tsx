'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import s from './Step1.module.scss';
import InputField from '@/app/components/ui/InputField/index';
import Button from '@/app/components/ui/Button/Button';
import { useAppSelector } from '@/store/hooks';
import { MOCK_PRODUCTS, FALLBACK_PRODUCT } from '@/app/components/CartModal/products_mock';
import { useMemo } from 'react';
import clsx from 'clsx';
import { usePhoneMask } from '@/hooks/usePhoneMask';

// ── Step Indicator ────────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
    const steps = [
        { num: 1, label: 'Крок 1' },
        { num: 2, label: 'Крок 2' },
        { num: 3, label: 'Крок 3' },
    ];

    return (
        <div className={s.stepIndicator}>
            {steps.map((step, idx) => (
                <React.Fragment key={step.num}>
                    <div className={s.stepItem}>
                        <div
                            className={clsx(s.stepCircle, {
                                [s.stepCircleActive]: current === step.num,
                                [s.stepCircleDone]: current > step.num,
                            })}
                        >
                            {current > step.num ? (
                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                    <path
                                        d="M1 3.5L3.8 6.5L9 1"
                                        stroke="white"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            ) : (
                                step.num
                            )}
                        </div>
                        <span
                            className={clsx(s.stepLabel, {
                                [s.stepLabelActive]: current === step.num,
                            })}
                        >
                            {step.label}
                        </span>
                    </div>
                    {idx < steps.length - 1 && (
                        <div
                            className={clsx(s.stepLine, {
                                [s.stepLineDone]: current > step.num,
                            })}
                        />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}

// ── Cart Summary ──────────────────────────────────────────────────────────────

function CartSummary({ onEditCart }: { onEditCart: () => void }) {
    const cartItems = useAppSelector(state => state.cart.items);

    const populatedItems = useMemo(() => {
        return cartItems.map(item => {
            const product = MOCK_PRODUCTS[item.id] || FALLBACK_PRODUCT;
            return { ...item, product };
        });
    }, [cartItems]);

    const totalSum = useMemo(() => {
        return populatedItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    }, [populatedItems]);

    const delivery = 120;
    const cashback = Math.round(totalSum * 0.03);

    return (
        <div className={s.cartSummary}>
            <div className={s.cartHeader}>
                <div className={s.cartTitle}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="15" viewBox="0 0 14 15" fill="none">
                        <path
                            d="M3.57532 5.99551C2.82203 10.329 9.95312 11.0512 9.57446 5.99551M3.57532 4.10525C2.82203 -0.228233 9.95312 -0.950481 9.57446 4.10525M0.578125 4.55101H12.5781V12.1346C12.5781 12.9324 11.9066 13.5791 11.0781 13.5791H2.07812C1.2497 13.5791 0.578125 12.9324 0.578125 12.1346V4.55101Z"
                            stroke="black"
                            strokeWidth="1.15789"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    Ваш кошик
                </div>
                <button className={s.editCartBtn} aria-label="Редагувати кошик" onClick={onEditCart} type="button">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.8 1.4L12.6 4.2L4.2 12.6H1.4V9.8L9.8 1.4Z" stroke="black" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Редагувати кошик</span>
                </button>
            </div>

            <div className={s.cartDivider} />

            <div className={s.cartItems}>
                {populatedItems.length === 0 ? (
                    <p className={s.emptyCart}>Кошик порожній</p>
                ) : (
                    populatedItems.map(item => (
                        <div key={item.id} className={s.cartItem}>
                            <div className={s.cartItemImg}>
                                <Image
                                    src={item.product.image}
                                    alt={item.product.title}
                                    width={84}
                                    height={60}
                                    className={s.cartImg}
                                />
                            </div>
                            <div className={s.cartItemInfo}>
                                <p className={s.cartItemTitle}>{item.product.title}</p>
                                <p className={s.cartItemWeight}>{item.product.weight}</p>
                            </div>
                            <div className={s.cartItemRight}>
                                <span className={s.cartItemPrice}>{item.product.price * item.quantity} ₴</span>
                                <span className={s.cartItemUnit}>упаковка</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {populatedItems.length > 0 && (
                <>
                    <div className={s.cartDivider} />

                    <div className={s.cartStats}>
                        <div className={s.cartStat}>
                            <span className={s.cartStatLabel}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none">
                                    <path d="M9.8505 7.4305H7.359C7.21313 7.4305 7.07324 7.48845 6.97009 7.59159C6.86695 7.69474 6.809 7.83463 6.809 7.9805C6.809 8.12637 6.86695 8.26626 6.97009 8.36941C7.07324 8.47255 7.21313 8.5305 7.359 8.5305H8.679C8.07232 9.1645 7.28992 9.60262 6.43234 9.78857C5.57476 9.97451 4.68116 9.89978 3.86638 9.57399C3.05159 9.24819 2.35283 8.68621 1.85987 7.96024C1.36692 7.23428 1.1023 6.37751 1.1 5.5C1.1 5.35413 1.04205 5.21424 0.938909 5.11109C0.835764 5.00795 0.695869 4.95 0.55 4.95C0.404131 4.95 0.264236 5.00795 0.161091 5.11109C0.0579462 5.21424 0 5.35413 0 5.5C0.00290766 6.57404 0.320222 7.62372 0.912782 8.51952C1.50534 9.41531 2.34722 10.118 3.33451 10.5409C4.3218 10.9637 5.4113 11.0883 6.46856 10.8992C7.52582 10.71 8.50456 10.2154 9.284 9.4765V10.45C9.284 10.5959 9.34195 10.7358 9.44509 10.8389C9.54824 10.9421 9.68813 11 9.834 11C9.97987 11 10.1198 10.9421 10.2229 10.8389C10.3261 10.7358 10.384 10.5959 10.384 10.45V7.975C10.3826 7.8329 10.3263 7.69684 10.2269 7.59533C10.1274 7.49383 9.99254 7.43476 9.8505 7.4305ZM5.5 0C4.09001 0.00402171 2.73542 0.549403 1.716 1.5235V0.55C1.716 0.404131 1.65805 0.264236 1.55491 0.161091C1.45176 0.0579462 1.31187 0 1.166 0C1.02013 0 0.880236 0.0579462 0.777091 0.161091C0.673946 0.264236 0.616 0.404131 0.616 0.55V3.025C0.616 3.17087 0.673946 3.31076 0.777091 3.41391C0.880236 3.51705 1.02013 3.575 1.166 3.575H3.641C3.78687 3.575 3.92676 3.51705 4.02991 3.41391C4.13305 3.31076 4.191 3.17087 4.191 3.025C4.191 2.87913 4.13305 2.73924 4.02991 2.63609C3.92676 2.53295 3.78687 2.475 3.641 2.475H2.321C2.92736 1.84133 3.70925 1.40332 4.56632 1.21721C5.42339 1.03109 6.31652 1.10536 7.13108 1.43047C7.94564 1.75559 8.64446 2.31672 9.13783 3.04183C9.6312 3.76695 9.89661 4.62296 9.9 5.5C9.9 5.64587 9.95795 5.78576 10.0611 5.88891C10.1642 5.99205 10.3041 6.05 10.45 6.05C10.5959 6.05 10.7358 5.99205 10.8389 5.88891C10.9421 5.78576 11 5.64587 11 5.5C11 4.77773 10.8577 4.06253 10.5813 3.39524C10.3049 2.72795 9.89981 2.12163 9.38909 1.61091C8.87837 1.10019 8.27205 0.695063 7.60476 0.418663C6.93747 0.142262 6.22227 0 5.5 0Z" fill="black" />
                                </svg>
                                Кешбек балами:
                            </span>
                            <span className={s.cartStatVal}>{cashback} Б</span>
                        </div>
                        <div className={s.cartStat}>
                            <span className={s.cartStatLabel}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none">
                                    <path d="M3.85 5.50109H2.75C2.60413 5.50109 2.46424 5.55903 2.36109 5.66215C2.25795 5.76528 2.2 5.90514 2.2 6.05098C2.2 6.19682 2.25795 6.33669 2.36109 6.43981C2.46424 6.54294 2.60413 6.60087 2.75 6.60087H3.85C3.99587 6.60087 4.13577 6.54294 4.23891 6.43981C4.34206 6.33669 4.4 6.19682 4.4 6.05098C4.4 5.90514 4.34206 5.76528 4.23891 5.66215C4.13577 5.55903 3.99587 5.50109 3.85 5.50109ZM3.3 4.40131H5.5C5.64587 4.40131 5.78577 4.34338 5.88891 4.24025C5.99206 4.13713 6.05 3.99726 6.05 3.85142C6.05 3.70558 5.99206 3.56571 5.88891 3.46259C5.78577 3.35946 5.64587 3.30153 5.5 3.30153H3.3C3.15413 3.30153 3.01424 3.35946 2.91109 3.46259C2.80795 3.56571 2.75 3.70558 2.75 3.85142C2.75 3.99726 2.80795 4.13713 2.91109 4.24025C3.01424 4.34338 3.15413 4.40131 3.3 4.40131ZM3.85 7.70066H2.75C2.60413 7.70066 2.46424 7.75859 2.36109 7.86171C2.25795 7.96484 2.2 8.10471 2.2 8.25055C2.2 8.39639 2.25795 8.53625 2.36109 8.63938C2.46424 8.7425 2.60413 8.80044 2.75 8.80044H3.85C3.99587 8.80044 4.13577 8.7425 4.23891 8.63938C4.34206 8.53625 4.4 8.39639 4.4 8.25055C4.4 8.10471 4.34206 7.96484 4.23891 7.86171C4.13577 7.75859 3.99587 7.70066 3.85 7.70066ZM10.45 5.50109H8.8V0.552076C8.80039 0.45518 8.77515 0.359903 8.72686 0.275891C8.67857 0.19188 8.60893 0.122119 8.525 0.0736714C8.44139 0.0254084 8.34655 0 8.25 0C8.15346 0 8.05861 0.0254084 7.975 0.0736714L6.325 1.01948L4.675 0.0736714C4.59139 0.0254084 4.49655 0 4.4 0C4.30346 0 4.20861 0.0254084 4.125 0.0736714L2.475 1.01948L0.825004 0.0736714C0.741393 0.0254084 0.646549 0 0.550004 0C0.453459 0 0.358615 0.0254084 0.275004 0.0736714C0.191072 0.122119 0.121434 0.19188 0.0731423 0.275891C0.0248505 0.359903 -0.000380426 0.45518 4.33558e-06 0.552076V9.35033C4.33558e-06 9.78785 0.173843 10.2074 0.483278 10.5168C0.792713 10.8262 1.2124 11 1.65 11H9.35C9.78761 11 10.2073 10.8262 10.5167 10.5168C10.8262 10.2074 11 9.78785 11 9.35033V6.05098C11 5.90514 10.9421 5.76528 10.8389 5.66215C10.7358 5.55903 10.5959 5.50109 10.45 5.50109ZM1.65 9.90022C1.50413 9.90022 1.36424 9.84228 1.2611 9.73916C1.15795 9.63603 1.1 9.49617 1.1 9.35033V1.50339L2.2 2.13026C2.28489 2.17459 2.37924 2.19774 2.475 2.19774C2.57077 2.19774 2.66512 2.17459 2.75 2.13026L4.4 1.18445L6.05 2.13026C6.13489 2.17459 6.22923 2.19774 6.325 2.19774C6.42077 2.19774 6.51512 2.17459 6.6 2.13026L7.7 1.50339V9.35033C7.70149 9.53792 7.73497 9.72388 7.799 9.90022H1.65ZM9.9 9.35033C9.9 9.49617 9.84205 9.63603 9.73891 9.73916C9.63576 9.84228 9.49587 9.90022 9.35 9.90022C9.20413 9.90022 9.06424 9.84228 8.96109 9.73916C8.85795 9.63603 8.8 9.49617 8.8 9.35033V6.60087H9.9V9.35033Z" fill="black" />
                                </svg>
                                Доставка:
                            </span>
                            <span className={s.cartStatVal}>{delivery} ₴</span>
                        </div>
                        <div className={s.cartStat}>
                            <span className={s.cartStatLabel}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none">
                                    <path d="M9.8505 7.4305H7.359C7.21313 7.4305 7.07324 7.48845 6.97009 7.59159C6.86695 7.69474 6.809 7.83463 6.809 7.9805C6.809 8.12637 6.86695 8.26626 6.97009 8.36941C7.07324 8.47255 7.21313 8.5305 7.359 8.5305H8.679C8.07232 9.1645 7.28992 9.60262 6.43234 9.78857C5.57476 9.97451 4.68116 9.89978 3.86638 9.57399C3.05159 9.24819 2.35283 8.68621 1.85987 7.96024C1.36692 7.23428 1.1023 6.37751 1.1 5.5C1.1 5.35413 1.04205 5.21424 0.938909 5.11109C0.835764 5.00795 0.695869 4.95 0.55 4.95C0.404131 4.95 0.264236 5.00795 0.161091 5.11109C0.0579462 5.21424 0 5.35413 0 5.5C0.00290766 6.57404 0.320222 7.62372 0.912782 8.51952C1.50534 9.41531 2.34722 10.118 3.33451 10.5409C4.3218 10.9637 5.4113 11.0883 6.46856 10.8992C7.52582 10.71 8.50456 10.2154 9.284 9.4765V10.45C9.284 10.5959 9.34195 10.7358 9.44509 10.8389C9.54824 10.9421 9.68813 11 9.834 11C9.97987 11 10.1198 10.9421 10.2229 10.8389C10.3261 10.7358 10.384 10.5959 10.384 10.45V7.975C10.3826 7.8329 10.3263 7.69684 10.2269 7.59533C10.1274 7.49383 9.99254 7.43476 9.8505 7.4305ZM5.5 0C4.09001 0.00402171 2.73542 0.549403 1.716 1.5235V0.55C1.716 0.404131 1.65805 0.264236 1.55491 0.161091C1.45176 0.0579462 1.31187 0 1.166 0C1.02013 0 0.880236 0.0579462 0.777091 0.161091C0.673946 0.264236 0.616 0.404131 0.616 0.55V3.025C0.616 3.17087 0.673946 3.31076 0.777091 3.41391C0.880236 3.51705 1.02013 3.575 1.166 3.575H3.641C3.78687 3.575 3.92676 3.51705 4.02991 3.41391C4.13305 3.31076 4.191 3.17087 4.191 3.025C4.191 2.87913 4.13305 2.73924 4.02991 2.63609C3.92676 2.53295 3.78687 2.475 3.641 2.475H2.321C2.92736 1.84133 3.70925 1.40332 4.56632 1.21721C5.42339 1.03109 6.31652 1.10536 7.13108 1.43047C7.94564 1.75559 8.64446 2.31672 9.13783 3.04183C9.6312 3.76695 9.89661 4.62296 9.9 5.5C9.9 5.64587 9.95795 5.78576 10.0611 5.88891C10.1642 5.99205 10.3041 6.05 10.45 6.05C10.5959 6.05 10.7358 5.99205 10.8389 5.88891C10.9421 5.78576 11 5.64587 11 5.5C11 4.77773 10.8577 4.06253 10.5813 3.39524C10.3049 2.72795 9.89981 2.12163 9.38909 1.61091C8.87837 1.10019 8.27205 0.695063 7.60476 0.418663C6.93747 0.142262 6.22227 0 5.5 0Z" fill="#E3051B" />
                                </svg>
                                Загальна сума:
                            </span>
                            <span className={clsx(s.cartStatVal, s.cartStatRed)}>
                                {totalSum + delivery} ₴
                            </span>
                        </div>
                    </div>
                </>
            )}

            <div className={s.promoWrapper}>
                <button className={s.promoBtn} id="promo-code-btn">
                    ДОДАТИ ПРОМОКОД / СЕРТИФІКАТ
                </button>
            </div>

            <p className={s.packageNote}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="7" cy="7" r="6.5" stroke="#E3051B" />
                    <path d="M7 4V7.5" stroke="#E3051B" strokeWidth="1.2" strokeLinecap="round" />
                    <circle cx="7" cy="9.5" r="0.6" fill="#E3051B" />
                </svg>
                До загальної суми замовлення не входить вартість пакету
            </p>
        </div>
    );
}

// ── Main Step1 Component ──────────────────────────────────────────────────────

import { useRouter } from 'next/navigation';
import CartModal from '@/app/components/CartModal/CartModal';

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
}

export default function Step1() {
    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        smsCode: '',
        agreed: false,
        anotherRecipient: false,
    });

    const [touched, setTouched] = useState<Touched>({});
    const [codeSent, setCodeSent] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    
    // Cart modal functionality
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);
    const cartItems = useAppSelector(state => state.cart.items);
    const router = useRouter();

    const handleCloseCartModal = () => {
        setIsCartModalOpen(false);
        // If user deleted all items and closed cart, redirect to main page
        if (cartItems.length === 0) {
            router.push('/');
        }
    };

    const handleChange = (field: keyof FormData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const { formatted: phoneFormatted, handleChange: handlePhoneChange } = usePhoneMask(
        formData.phone,
        (raw: string) => handleChange('phone', raw),
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

    const handleSendCode = () => {
        if (!formData.phone.trim()) {
            setTouched(prev => ({ ...prev, phone: true }));
            return;
        }
        setCodeSent(true);
        setCountdown(60);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const allTouched: Touched = {
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            smsCode: true,
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

                <button className={s.hasAccountBtn} id="has-account-btn" type="button">
                    У ВАС Є АККАУНТ?
                </button>

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
                        />
                    </div>

                    <div className={s.formRow}>
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
                            error={errors.phone}
                            touched={touched.phone}
                        />
                        <InputField
                            id="checkout-email"
                            label="E-mail"
                            type="email"
                            value={formData.email}
                            onChange={e => handleChange('email', e.target.value)}
                            onBlur={() => handleBlur('email')}
                        />
                    </div>

                    {formData.phone.trim().length > 0 && (
                        <div className={s.smsRow}>
                            <InputField
                                id="checkout-sms-code"
                                label="Введіть код з СМС"
                                value={formData.smsCode}
                                onChange={e => handleChange('smsCode', e.target.value)}
                                onBlur={() => handleBlur('smsCode')}
                                className={s.smsInput}
                            />
                            <div className={s.smsActionCol}>
                                {codeSent ? (
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
                                    onClick={handleSendCode}
                                    disabled={countdown > 0}
                                >
                                    Відправити код
                                </button>
                            </div>
                        </div>
                    )}

                    <div className={s.divider} />

                    <div className={s.checkboxRow}>
                        <label className={s.checkboxLabel} htmlFor="checkout-agree">
                            <input
                                id="checkout-agree"
                                type="checkbox"
                                className={s.checkboxInput}
                                checked={formData.agreed}
                                onChange={e => handleChange('agreed', e.target.checked)}
                            />
                            <span className={clsx(s.checkboxCustom, { [s.checkboxChecked]: formData.agreed })}>
                                {formData.agreed && (
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                        <path d="M1 3.5L3.8 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </span>
                            <span className={s.checkboxText}>
                                Я згоден з{' '}
                                <button
                                    type="button"
                                    className={s.inlineLink}
                                    onClick={e => e.stopPropagation()}
                                >
                                    угодою користувача
                                </button>
                            </span>
                        </label>

                        <label className={s.checkboxLabel} htmlFor="checkout-another-recipient">
                            <input
                                id="checkout-another-recipient"
                                type="checkbox"
                                className={s.checkboxInput}
                                checked={formData.anotherRecipient}
                                onChange={e => handleChange('anotherRecipient', e.target.checked)}
                            />
                            <span className={clsx(s.checkboxCustom, { [s.checkboxChecked]: formData.anotherRecipient })}>
                                {formData.anotherRecipient && (
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                        <path d="M1 3.5L3.8 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </span>
                            <span className={s.checkboxText}>Додати іншого отримувача</span>
                        </label>
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

            {/* ── Right: Cart Summary ── */}
            <CartSummary onEditCart={() => setIsCartModalOpen(true)} />
            
            {/* ── Cart Modal ── */}
            <CartModal isOpen={isCartModalOpen} onClose={handleCloseCartModal} />
        </div>
    );
}
