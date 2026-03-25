'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePhoneMask } from '@/hooks/usePhoneMask';
import s from './AuthModal.module.scss';
import Button from "@/app/components/ui/Button/Button";
import InputField from '@/app/components/ui/InputField';

const COUNTDOWN_SECONDS = 60;
const PHONE_REGEX = /^380\d{9}$/;

interface ForgotPasswordFormProps {
    onVerified: (phone: string) => void;
    onBack: () => void;
}

export default function ForgotPasswordForm({ onVerified, onBack }: ForgotPasswordFormProps) {
    const [phone, setPhone] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [phoneTouched, setPhoneTouched] = useState(false);

    const [phoneVerified, setPhoneVerified] = useState(false);

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

    const phoneComplete = PHONE_REGEX.test(phone);

    const handlePhoneRawChange = useCallback((raw: string) => {
        setPhone(raw);
        setPhoneVerified(false);
        setSmsRequested(false);
        setSmsCode('');
        setSmsError('');
        setCountdown(0);
        stopCountdown();
    }, [stopCountdown]);

    const { formatted: phoneFormatted, handleChange: handlePhoneChange } = usePhoneMask(
        phone,
        handlePhoneRawChange,
    );

    const validatePhone = () => {
        if (!phone) {
            setPhoneError("Обов'язкове поле");
            return false;
        }
        if (!PHONE_REGEX.test(phone)) {
            setPhoneError('Введіть повний номер: +38 (0XX) XXX XX XX');
            return false;
        }
        setPhoneError('');
        return true;
    };

    const handleSendSms = async () => {
        setSmsError('');
        setSmsSending(true);
        try {
            const res = await fetch('/api/send-sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone }),
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
                body: JSON.stringify({ phone, code: smsCode.trim() }),
            });
            const data = await res.json();
            if (data.valid) {
                setPhoneVerified(true);
                stopCountdown();
                setCountdown(0);
                setSmsRequested(false);
                setSmsCode('');
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
        const cleaned = value.replace(/\D/g, '').slice(0, 6);
        setSmsCode(cleaned);
        if (smsError) setSmsError('');
    };

    const handleRestore = () => {
        if (!phoneVerified) return;
        onVerified(phone);
    };

    return (
        <>
            <h2 className={s.title}>Відновлення паролю</h2>
            <form
                className={s.form}
                noValidate
                autoComplete="off"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleRestore();
                }}
            >
                {/* Phone */}
                <div className={s.field}>
                    <InputField
                        id="forgot-phone"
                        type="tel"
                        autoComplete="off"
                        readOnly
                        onFocus={(e) => {
                            e.currentTarget.removeAttribute('readonly');
                            setPhoneTouched(false);
                        }}
                        className={phoneVerified ? s.inputVerified : undefined}
                        label="Телефон"
                        required
                        value={phoneFormatted}
                        onChange={handlePhoneChange}
                        onBlur={() => {
                            setPhoneTouched(true);
                            validatePhone();
                        }}
                        error={!phoneVerified ? phoneError : undefined}
                        touched={phoneTouched}
                    />

                    {/* Verified badge */}
                    {phoneVerified && (
                        <span className={s.verifiedBadge}>
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                                <circle cx="6.5" cy="6.5" r="6.5" fill="#2a9d5c" />
                                <path d="M3.5 6.5L5.5 8.5L9.5 4.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Номер підтверджено
                        </span>
                    )}

                    {/* SMS block */}
                    {phoneComplete && !phoneVerified && (
                        <div className={s.smsBlock}>
                            {countdown > 0 && (
                                <p className={s.timerText}>
                                    Відправити код повторно можна буде через:{' '}
                                    <span className={s.timerCount}>{countdown}</span>
                                </p>
                            )}

                            <div className={s.smsInputRow}>
                                <input
                                    id="forgot-sms-code"
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
                                                : 'Отримати смс'}
                                </button>
                            </div>

                            {smsError && <span className={s.fieldError}>{smsError}</span>}
                        </div>
                    )}
                </div>

                <Button
                    type="submit"
                    className={s.submitBtn}
                    disabled={!phoneVerified}
                    variant='red'
                >
                    Відновити
                </Button>

                <div className={s.switchText}>
                    <button type="button" className={s.switchLink} onClick={onBack}>
                        Повернутись до входу
                    </button>
                </div>
            </form>
        </>
    );
}
