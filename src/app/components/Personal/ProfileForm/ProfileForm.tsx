'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import InputField from '@/app/components/ui/InputField';
import Button from '@/app/components/ui/Button/Button';
import s from './ProfileForm.module.scss';
import clsx from 'clsx';
import { AuthUser } from '@/store/slices/authSlice';
import GoogleAuthButton from '@/app/components/AuthModal/GoogleAuthButton';
import { usePhoneMask } from '@/hooks/usePhoneMask';
import { sendSmsApi, smsVerifyApi } from '@/lib/graphql/queries/auth';

const COUNTDOWN_SECONDS = 60;
const PHONE_REGEX = /^380\d{9}$/;

interface ProfileFormProps {
    user: AuthUser | null;
    dict: {
        personalDataTitle: string;
        firstName: string;
        lastName: string;
        middleName: string;
        phone: string;
        email: string;
        birthday: string;
        gender: {
            title: string;
            male: string;
            female: string;
        };
        googleAuth: string;
        saveButton: string;
    };
    onSubmit: (values: any) => void;
}

export default function ProfileForm({ user, dict, onSubmit }: ProfileFormProps) {
    // SMS verification state
    const [phoneVerified, setPhoneVerified] = useState(true);
    const [smsRequested, setSmsRequested] = useState(false);
    const [smsCode, setSmsCode] = useState('');
    const [smsError, setSmsError] = useState('');
    const [smsSending, setSmsSending] = useState(false);
    const [smsVerifying, setSmsVerifying] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [smsToken, setSmsToken] = useState('');
    
    // Action token from verify mutation (if needed by backend, though updateUserData schema doesn't show it, 
    // we use it for UI verification state)
    // const [actionToken, setActionToken] = useState('');

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
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [stopCountdown]);

    useEffect(() => {
        return () => stopCountdown();
    }, [stopCountdown]);

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Обов\'язкове поле'),
        surname: Yup.string().required('Обов\'язкове поле'),
        email: Yup.string().email('Некоректний email'),
        phone: Yup.string()
            .required('Обов\'язкове поле')
            .matches(PHONE_REGEX, 'Введіть повний номер: +38 (0XX) XXX XX XX')
            .test('phone-verified', 'Підтвердіть номер телефону через SMS', (value) => {
                if (value === user?.phone) return true;
                return phoneVerified;
            }),
    });

    const initialValues = {
        name: user?.name || '',
        surname: user?.surname || '',
        middleName: user?.middleName || '',
        phone: user?.phone || '',
        email: user?.email || '',
        birthday: user?.birthday || '',
        gender: user?.sex || 'male', // Changed from user?.gender to user?.sex based on typical backend values
    };

    const formik = useFormik({
        initialValues,
        validationSchema,
        enableReinitialize: true,
        onSubmit: (values) => {
            onSubmit(values);
        },
    });

    const handlePhoneRawChange = useCallback(
        (raw: string) => {
            formik.setFieldValue('phone', raw);
            
            // If phone matches original user phone, it's considered verified
            if (raw === user?.phone) {
                setPhoneVerified(true);
                setSmsRequested(false);
                setSmsError('');
                setCountdown(0);
                stopCountdown();
            } else {
                setPhoneVerified(false);
            }
        },
        [user?.phone, formik, stopCountdown],
    );

    const { formatted: phoneFormatted, handleChange: handlePhoneChange, handleFocus: handlePhoneFocus } = usePhoneMask(
        formik.values.phone,
        handlePhoneRawChange,
    );

    const currentPhone = formik.values.phone;
    const phoneComplete = PHONE_REGEX.test(currentPhone);
    const isNewPhone = currentPhone !== user?.phone;

    const handleSendSms = async () => {
        setSmsError('');
        setSmsSending(true);
        try {
            const result = await sendSmsApi(currentPhone);
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
            await smsVerifyApi(smsToken, smsCode.trim());
            setPhoneVerified(true);
            stopCountdown();
            setCountdown(0);
            setSmsRequested(false);
            setSmsCode('');
            formik.validateField('phone');
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

    return (
        <div className={s.profileFormContainer}>
            <h2 className={s.sectionTitle}>{dict.personalDataTitle}</h2>
            
            <form className={s.form} onSubmit={formik.handleSubmit}>
                <div className={s.fieldsGrid}>
                    <InputField
                        id="name"
                        name="name"
                        label={dict.firstName}
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.errors.name}
                        touched={formik.touched.name}
                        required
                    />
                    <InputField
                        id="surname"
                        name="surname"
                        label={dict.lastName}
                        value={formik.values.surname}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.errors.surname}
                        touched={formik.touched.surname}
                        required
                    />
                    <InputField
                        id="middleName"
                        name="middleName"
                        label={dict.middleName}
                        value={formik.values.middleName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.errors.middleName}
                        touched={formik.touched.middleName}
                    />
                    <div className={s.field}>
                        <InputField
                            id="phone"
                            name="phone"
                            label={dict.phone}
                            type="tel"
                            value={phoneFormatted}
                            onChange={handlePhoneChange}
                            onFocus={handlePhoneFocus}
                            onBlur={formik.handleBlur}
                            error={formik.touched.phone ? formik.errors.phone : undefined}
                            touched={formik.touched.phone}
                            required
                            className={clsx(phoneVerified && s.inputVerified)}
                        />
                        {/* SMS Logic for New Phone */}
                        {isNewPhone && phoneComplete && !phoneVerified && (
                            <div className={s.smsBlock}>
                                {countdown > 0 && (
                                    <p className={s.timerText}>
                                        Відправити код повторно можна буде через:{' '}
                                        <span className={s.timerCount}>{countdown}</span>
                                    </p>
                                )}

                                <div className={s.smsInputRow}>
                                    <input
                                        id="sms-code-profile"
                                        type="text"
                                        inputMode="numeric"
                                        className={s.smsInput}
                                        placeholder="Введіть код з СМС"
                                        value={smsCode}
                                        onChange={(e) => handleSmsCodeChange(e.target.value)}
                                        disabled={!smsRequested}
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
                        {phoneVerified && isNewPhone && (
                            <span className={s.verifiedBadge}>
                                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                                    <circle cx="6.5" cy="6.5" r="6.5" fill="#2a9d5c" />
                                    <path d="M3.5 6.5L5.5 8.5L9.5 4.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Номер підтверджено
                            </span>
                        )}
                    </div>
                    <InputField
                        id="email"
                        name="email"
                        label={dict.email}
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.errors.email}
                        touched={formik.touched.email}
                    />
                    <InputField
                        id="birthday"
                        name="birthday"
                        label={dict.birthday}
                        type="date"
                        value={formik.values.birthday}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                    />
                </div>

                <div className={s.genderSection}>
                    <span className={s.genderTitle}>{dict.gender.title}</span>
                    <div className={s.genderOptions}>
                        <button
                            type="button"
                            className={clsx(s.genderBtn, formik.values.gender === 'male' && s.active)}
                            onClick={() => formik.setFieldValue('gender', 'male')}
                        >
                            <div className={s.radioCircle}>
                                {formik.values.gender === 'male' && <div className={s.innerCircle} />}
                            </div>
                            <span>{dict.gender.male}</span>
                        </button>
                        <button
                            type="button"
                            className={clsx(s.genderBtn, formik.values.gender === 'female' && s.active)}
                            onClick={() => formik.setFieldValue('gender', 'female')}
                        >
                            <div className={s.radioCircle}>
                                {formik.values.gender === 'female' && <div className={s.innerCircle} />}
                            </div>
                            <span>{dict.gender.female}</span>
                        </button>
                    </div>
                </div>

                {!user?.email && (
                    <div className={s.socialConnect}>
                        <GoogleAuthButton 
                            onSuccess={(updatedUser) => {
                                onSubmit(updatedUser);
                            }}
                        />
                    </div>
                )}

                <div className={s.actions}>
                    <Button 
                        type="submit" 
                        variant="black" 
                        className={s.submitBtn}
                        disabled={formik.isSubmitting || (isNewPhone && !phoneVerified)}
                    >
                        {formik.isSubmitting ? 'Зберігаємо...' : dict.saveButton}
                    </Button>
                </div>
            </form>
        </div>
    );
}
