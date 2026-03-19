'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch } from '@/store/hooks';
import { login } from '@/store/slices/authSlice';
import { usePhoneMask } from '@/hooks/usePhoneMask';
import clsx from 'clsx';
import s from './AuthModal.module.scss';
import GoogleAuthButton from './GoogleAuthButton';
import Button from "@/app/components/ui/Button/Button";
import InputField from '@/app/components/ui/InputField';

const COUNTDOWN_SECONDS = 60;
const PHONE_REGEX = /^380\d{9}$/;

// Stub API call for registration
async function registerAPI(data: { name: string; phone: string; password: string }) {
    return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            if (data.phone && data.password) {
                resolve();
            } else {
                reject(new Error('Заповніть усі поля'));
            }
        }, 500);
    });
}

interface RegisterFormProps {
    onSwitchToLogin: () => void;
    onSuccess: () => void;
}

export default function RegisterForm({ onSwitchToLogin, onSuccess }: RegisterFormProps) {
    const dispatch = useAppDispatch();
    const router = useRouter();

    // Set of phone numbers already verified in this modal session
    const verifiedPhonesRef = useRef<Set<string>>(new Set());

    // Whether the current phone value is verified
    const [phoneVerified, setPhoneVerified] = useState(false);
    // Ref-synced version for Yup validation (avoids stale closure)
    const phoneVerifiedRef = useRef(false);

    // SMS state
    const [smsRequested, setSmsRequested] = useState(false);
    const [smsCode, setSmsCode] = useState('');
    const [smsError, setSmsError] = useState('');
    const [smsSending, setSmsSending] = useState(false);
    const [smsVerifying, setSmsVerifying] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const stopCountdown = useCallback(() => {
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }
    }, []);

    const startCountdown = useCallback(() => {
        stopCountdown();
        setCountdown(COUNTDOWN_SECONDS);
        countdownRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    stopCountdown();
                    // 60 s elapsed — reset SMS state so user must re-request
                    setSmsRequested(false);
                    setSmsCode('');
                    setSmsError('');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [stopCountdown]);

    useEffect(() => {
        return () => stopCountdown();
    }, [stopCountdown]);

    const registerSchema = Yup.object({
        name: Yup.string()
            .required('Обов\'язкове поле')
            .min(2, 'Мінімум 2 символи'),
        phone: Yup.string()
            .required('Обов\'язкове поле')
            .matches(PHONE_REGEX, 'Введіть повний номер: +38 (0XX) XXX XX XX')
            .test('phone-verified', 'Підтвердіть номер телефону через SMS', () => {
                return phoneVerifiedRef.current;
            }),
        password: Yup.string()
            .required('Обов\'язкове поле')
            .min(6, 'Мінімум 6 символів'),
        confirmPassword: Yup.string()
            .required('Обов\'язкове поле')
            .oneOf([Yup.ref('password')], 'Паролі не збігаються'),
    });

    const formik = useFormik({
        initialValues: {
            name: '',
            phone: '',
            password: '',
            confirmPassword: '',
        },
        validationSchema: registerSchema,
        onSubmit: async (values, { setStatus }) => {
            try {
                await registerAPI({ name: values.name, phone: values.phone, password: values.password });
                dispatch(login({
                    email: `${values.phone.slice(-4)}@myastoriya.ua`,
                    phone: values.phone,
                    name: values.name,
                }));
                onSuccess();
            } catch (err: any) {
                setStatus(err.message || 'Помилка реєстрації');
            }
        },
    });

    // Keep ref in sync with state
    useEffect(() => {
        phoneVerifiedRef.current = phoneVerified;
    }, [phoneVerified]);

    const currentPhone = formik.values.phone;
    const phoneComplete = PHONE_REGEX.test(currentPhone);

    // Reset SMS state when phone changes
    const handlePhoneRawChange = useCallback((raw: string) => {
        formik.setFieldValue('phone', raw);

        const newPhoneComplete = PHONE_REGEX.test(raw);

        if (newPhoneComplete && verifiedPhonesRef.current.has(raw)) {
            setPhoneVerified(true);
            phoneVerifiedRef.current = true;
        } else {
            setPhoneVerified(false);
            phoneVerifiedRef.current = false;
            setSmsRequested(false);
            setSmsCode('');
            setSmsError('');
            setCountdown(0);
            stopCountdown();
        }
    }, [formik, stopCountdown]);

    const { formatted: phoneFormatted, handleChange: handlePhoneChange } = usePhoneMask(
        formik.values.phone,
        handlePhoneRawChange,
    );

    const handleSendSms = async () => {
        setSmsError('');
        setSmsSending(true);
        try {
            const res = await fetch('/api/send-sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: currentPhone }),
            });
            const data = await res.json();
            if (!res.ok) {
                setSmsError(data.error || 'Помилка відправки SMS');
                return;
            }
            setSmsRequested(true);
            setSmsCode('');
            startCountdown();
        } catch {
            setSmsError('Помилка мережі. Спробуйте ще раз.');
        } finally {
            setSmsSending(false);
        }
    };

    const handleVerifySms = async () => {
        if (!smsCode.trim()) {
            setSmsError('Введіть код з SMS');
            return;
        }
        setSmsError('');
        setSmsVerifying(true);
        try {
            const res = await fetch('/api/verify-sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: currentPhone, code: smsCode.trim() }),
            });
            const data = await res.json();
            if (data.valid) {
                verifiedPhonesRef.current.add(currentPhone);
                setPhoneVerified(true);
                phoneVerifiedRef.current = true;
                stopCountdown();
                setCountdown(0);
                setSmsRequested(false);
                setSmsCode('');
                // Re-validate phone field to clear the "not verified" error
                formik.setFieldTouched('phone', true, true);
            } else {
                setSmsError(data.error || 'Невірний код. Спробуйте ще раз.');
                setSmsCode('');
            }
        } catch {
            setSmsError('Помилка мережі. Спробуйте ще раз.');
        } finally {
            setSmsVerifying(false);
        }
    };

    const handleSmsCodeChange = (value: string) => {
        // Allow only digits, max 6 chars
        const cleaned = value.replace(/\D/g, '').slice(0, 6);
        setSmsCode(cleaned);
        if (smsError) setSmsError('');
    };

    const isPhoneFieldError = formik.touched.phone && !!formik.errors.phone;

    return (
        <>
            <h2 className={s.title}>Реєстрація в кабінеті</h2>
            <form className={s.form} onSubmit={formik.handleSubmit} noValidate autoComplete="off">

                {/* Name */}
                <InputField
                    id="reg-name"
                    type="text"
                    name="name"
                    autoComplete="off"
                    readOnly
                    onFocus={(e) => {
                        e.currentTarget.removeAttribute('readonly');
                        formik.setFieldTouched('name', false);
                    }}
                    label="Ім'я"
                    required
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.errors.name}
                    touched={formik.touched.name}
                />

                {/* Phone */}
                <div className={s.field}>
                    <InputField
                        id="reg-phone"
                        type="tel"
                        name="phone"
                        autoComplete="off"
                        readOnly
                        onFocus={(e) => {
                            e.currentTarget.removeAttribute('readonly');
                            formik.setFieldTouched('phone', false);
                        }}
                        className={phoneVerified ? s.inputVerified : undefined}
                        label="Телефон"
                        required
                        value={phoneFormatted}
                        onChange={handlePhoneChange}
                        onBlur={() => formik.setFieldTouched('phone', true)}
                        error={!phoneVerified ? formik.errors.phone : undefined}
                        touched={formik.touched.phone}
                    />

                    {/* Verification badge */}
                    {phoneVerified && (
                        <span className={s.verifiedBadge}>
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                                <circle cx="6.5" cy="6.5" r="6.5" fill="#2a9d5c" />
                                <path d="M3.5 6.5L5.5 8.5L9.5 4.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Номер підтверджено
                        </span>
                    )}


                    {/* SMS block — shown when phone is complete and not yet verified */}
                    {phoneComplete && !phoneVerified && (
                        <div className={s.smsBlock}>
                            {/* Countdown timer */}
                            {countdown > 0 && (
                                <p className={s.timerText}>
                                    Відправити код повторно можна буде через:{' '}
                                    <span className={s.timerCount}>{countdown}</span>
                                </p>
                            )}

                            {/* Input + button row */}
                            <div className={s.smsInputRow}>
                                <input
                                    id="sms-code"
                                    type="text"
                                    inputMode="numeric"
                                    className={s.smsInput}
                                    placeholder="Введіть код з СМС"
                                    value={smsCode}
                                    onChange={(e) => handleSmsCodeChange(e.target.value)}
                                    disabled={!smsRequested}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            if (smsRequested) handleVerifySms();
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    className={s.smsSendBtn}
                                    disabled={smsSending || smsVerifying}
                                    onClick={smsRequested ? handleVerifySms : handleSendSms}
                                >
                                    {smsSending
                                        ? 'Надсилання...'
                                        : smsVerifying
                                            ? 'Перевірка...'
                                            : smsRequested
                                                ? 'Підтвердити'
                                                : 'Отримати смс'
                                    }
                                </button>
                            </div>

                            {/* SMS error */}
                            {smsError && <span className={s.fieldError}>{smsError}</span>}
                        </div>
                    )}
                </div>

                {/* Password */}
                <InputField
                    id="reg-password"
                    type="password"
                    name="password"
                    autoComplete="off"
                    readOnly
                    onFocus={(e) => {
                        e.currentTarget.removeAttribute('readonly');
                        formik.setFieldTouched('password', false);
                    }}
                    label="Пароль"
                    required
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.errors.password}
                    touched={formik.touched.password}
                />

                {/* Confirm password */}
                <InputField
                    id="reg-confirm-password"
                    type="password"
                    name="confirmPassword"
                    autoComplete="off"
                    readOnly
                    onFocus={(e) => {
                        e.currentTarget.removeAttribute('readonly');
                        formik.setFieldTouched('confirmPassword', false);
                    }}
                    label="Повторити пароль"
                    required
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.errors.confirmPassword}
                    touched={formik.touched.confirmPassword}
                />

                {formik.status && <div className={s.error}>{formik.status}</div>}

                <Button type="submit"
                        className={s.submitBtn}
                        disabled={formik.isSubmitting}
                        variant='red'
                >
                    {formik.isSubmitting ? 'Зачекайте...' : 'ЗАРЕЄСТРУВАТИСЬ'}
                </Button>

                <div className={s.switchText}>
                    <button type="button" className={s.switchLink} onClick={onSwitchToLogin}>
                        Вхід
                    </button>
                </div>

                <GoogleAuthButton onSuccess={(user) => {
                    dispatch(login(user));
                    router.push('/personal/profile/');
                    onSuccess();
                }} />
            </form>
        </>
    );
}
