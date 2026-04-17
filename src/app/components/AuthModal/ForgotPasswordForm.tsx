'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { usePhoneMask } from '@/hooks/usePhoneMask';
import { sendSmsApi, smsVerifyApi } from '@/lib/graphql/queries/auth';
import s from './AuthModal.module.scss';
import Button from '@/app/components/ui/Button/Button';
import InputField from '@/app/components/ui/InputField';

import { PHONE_REGEX } from '@/lib/utils/phone';

const COUNTDOWN_SECONDS = 60;

interface ForgotPasswordFormProps {
    /** Called when phone is verified — passes both phone and actionToken */
    onVerified: (phone: string, actionToken: string) => void;
    onBack: () => void;
}

export default function ForgotPasswordForm({ onVerified, onBack }: ForgotPasswordFormProps) {
    const params = useParams();
    const locale = (params?.lang as string) || 'ua';
    const [phone, setPhone] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [phoneTouched, setPhoneTouched] = useState(false);

    const [phoneVerified, setPhoneVerified] = useState(false);

    // SMS token from sendSMS mutation
    const [smsToken, setSmsToken] = useState('');

    // SMS UI state
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

    const handlePhoneRawChange = useCallback(
        (raw: string) => {
            setPhone(raw);
            setPhoneVerified(false);
            setSmsRequested(false);
            setSmsCode('');
            setSmsError('');
            setCountdown(0);
            stopCountdown();
        },
        [stopCountdown],
    );

    const { formatted: phoneFormatted, handleChange: handlePhoneChange, handleFocus: handlePhoneFocus } = usePhoneMask(
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
            const result = await sendSmsApi(phone, locale);
            setSmsToken(result.token);
            if (result.code) {
                console.info('[SMS DEV] Code:', result.code);
            }
            setSmsRequested(true);
            setSmsCode('');
            startCountdown();
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Помилка відправки SMS';
            setSmsError(msg);
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
            const result = await smsVerifyApi(smsToken, smsCode.trim(), locale);
            setPhoneVerified(true);
            stopCountdown();
            setCountdown(0);
            setSmsRequested(false);
            setSmsCode('');
            // Immediately proceed — pass phone + actionToken to parent
            onVerified(phone, result.token);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Невірний код. Спробуйте ще раз.';
            setSmsError(msg);
            setSmsCode('');
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
                            handlePhoneFocus();
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

                    {phoneVerified && (
                        <span className={s.verifiedBadge}>
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                                <circle cx="6.5" cy="6.5" r="6.5" fill="#2a9d5c" />
                                <path d="M3.5 6.5L5.5 8.5L9.5 4.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Номер підтверджено
                        </span>
                    )}

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
                    type="button"
                    className={s.submitBtn}
                    disabled={!phoneVerified}
                    variant="red"
                    onClick={handleRestore}
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
