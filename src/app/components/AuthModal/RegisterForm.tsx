'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch } from '@/store/hooks';
import { login } from '@/store/slices/authSlice';
import { sendSmsApi, smsVerifyApi, registrationApi, checkUserPhoneApi } from '@/lib/graphql/queries/auth';
import { setAuthCookies } from '@/app/actions/authActions';
import { usePhoneMask } from '@/hooks/usePhoneMask';
import { getOrCreateDeviceId } from '@/lib/utils/auth';
import { GraphQLError } from '@/lib/graphql/client';
import s from './AuthModal.module.scss';
import GoogleAuthButton from './GoogleAuthButton';
import Button from '@/app/components/ui/Button/Button';
import InputField from '@/app/components/ui/InputField';
import clsx from 'clsx';

const COUNTDOWN_SECONDS = 60;
const PHONE_REGEX = /^380\d{9}$/;

interface RegisterFormProps {
    onSwitchToLogin: () => void;
    onSuccess: () => void;
}

export default function RegisterForm({ onSwitchToLogin, onSuccess }: RegisterFormProps) {
    const dispatch = useAppDispatch();
    const params = useParams();
    const locale = (params?.lang as string) || 'ua';

    // Track verified phones and their SMS tokens in this session
    const verifiedPhonesRef = useRef<Map<string, string>>(new Map());

    const [phoneVerified, setPhoneVerified] = useState(false);
    const phoneVerifiedRef = useRef(false);

    // Current SMS token from sendSMS mutation
    const [smsToken, setSmsToken] = useState('');

    // Verified actionToken from smsVerify mutation
    const [actionToken, setActionToken] = useState('');

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

    const registerSchema = Yup.object({
        name: Yup.string().required('Обов\'язкове поле').min(2, 'Мінімум 2 символи'),
        surname: Yup.string().required('Обов\'язкове поле').min(2, 'Мінімум 2 символи'),
        phone: Yup.string()
            .required('Обов\'язкове поле')
            .matches(PHONE_REGEX, 'Введіть повний номер: +38 (0XX) XXX XX XX')
            .test('phone-verified', 'Підтвердіть номер телефону через SMS', () => {
                return phoneVerifiedRef.current;
            }),
        password: Yup.string().required('Обов\'язкове поле').min(6, 'Мінімум 6 символів'),
        confirmPassword: Yup.string()
            .required('Обов\'язкове поле')
            .oneOf([Yup.ref('password')], 'Паролі не збігаються'),
    });

    const formik = useFormik({
        initialValues: {
            name: '',
            surname: '',
            phone: '',
            password: '',
            confirmPassword: '',
        },
        validationSchema: registerSchema,
        onSubmit: async (values, { setStatus }) => {
            try {
                const deviceId = getOrCreateDeviceId();
                const result = await registrationApi(
                    {
                        name: values.name,
                        surname: values.surname,
                        phone: values.phone,
                        password: values.password,
                        actionToken,
                        deviceId,
                    },
                    locale,
                );
                await setAuthCookies(result.accessToken, result.refreshToken);
                dispatch(
                    login({
                        id: result.user.id,
                        name: result.user.name,
                        surname: result.user.surname,
                        phone: result.user.phone,
                        email: result.user.email,
                        birthday: result.user.birthday,
                        sex: result.user.sex,
                    }),
                );
                onSuccess();
            } catch (err) {
                let errorMessage = 'Помилка реєстрації';

                if (err instanceof GraphQLError && err.errors.length > 0) {
                    const firstError = err.errors[0];
                    const errorCode = firstError.extensions?.error_code;

                    if (errorCode === 25) {
                        errorMessage = locale === 'ua'
                            ? 'Користувач з таким номером телефону вже зареєстрований'
                            : 'Пользователь с таким номером телефона уже зарегистрирован';
                    } else {
                        errorMessage = err.message;
                    }
                } else if (err instanceof Error) {
                    errorMessage = err.message;
                }

                setStatus(errorMessage);
            }
        },
    });

    useEffect(() => {
        phoneVerifiedRef.current = phoneVerified;
    }, [phoneVerified]);

    const currentPhone = formik.values.phone;
    const phoneComplete = PHONE_REGEX.test(currentPhone);

    const handlePhoneRawChange = useCallback(
        (raw: string) => {
            formik.setFieldValue('phone', raw);
            const newPhoneComplete = PHONE_REGEX.test(raw);

            if (newPhoneComplete && verifiedPhonesRef.current.has(raw)) {
                const savedActionToken = verifiedPhonesRef.current.get(raw)!;
                setPhoneVerified(true);
                phoneVerifiedRef.current = true;
                setActionToken(savedActionToken);
            } else {
                setPhoneVerified(false);
                phoneVerifiedRef.current = false;
                setActionToken('');
                setSmsRequested(false);
                setSmsCode('');
                setSmsError('');
                setCountdown(0);
                stopCountdown();
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [stopCountdown],
    );

    const { formatted: phoneFormatted, handleChange: handlePhoneChange, handleFocus: handlePhoneFocus } = usePhoneMask(
        formik.values.phone,
        handlePhoneRawChange,
    );

    const handleSendSms = async () => {
        setSmsError('');
        setSmsSending(true);
        try {
            // Early check if user already exists
            const exists = await checkUserPhoneApi(currentPhone, locale);
            if (exists) {
                const msg = locale === 'ua' 
                    ? 'Цей номер уже зареєстрований. Будь ласка, увійдіть' 
                    : 'Этот номер уже зарегистрирован. Пожалуйста, войдите';
                formik.setFieldError('phone', msg);
                return;
            }

            const result = await sendSmsApi(currentPhone, locale);
            setSmsToken(result.token);
            // In developer mode the code is returned — show in console
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
            const verifiedActionToken = result.token;
            verifiedPhonesRef.current.set(currentPhone, verifiedActionToken);
            setActionToken(verifiedActionToken);
            setPhoneVerified(true);
            phoneVerifiedRef.current = true;
            stopCountdown();
            setCountdown(0);
            setSmsRequested(false);
            setSmsCode('');
            formik.setFieldTouched('phone', true, true);
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

                {/* Surname */}
                <InputField
                    id="reg-surname"
                    type="text"
                    name="surname"
                    autoComplete="off"
                    readOnly
                    onFocus={(e) => {
                        e.currentTarget.removeAttribute('readonly');
                        formik.setFieldTouched('surname', false);
                    }}
                    label="Прізвище"
                    required
                    value={formik.values.surname}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.errors.surname}
                    touched={formik.touched.surname}
                    className={s.inputFieldWrapper}
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
                            handlePhoneFocus();
                        }}
                        className={clsx(phoneVerified && s.inputVerified, s.inputFieldWrapper)}
                        label="Телефон"
                        required
                        value={phoneFormatted}
                        onChange={handlePhoneChange}
                        onBlur={async () => {
                            formik.setFieldTouched('phone', true);
                            if (PHONE_REGEX.test(formik.values.phone)) {
                                try {
                                    const exists = await checkUserPhoneApi(formik.values.phone, locale);
                                    if (exists) {
                                        const msg = locale === 'ua' 
                                            ? 'Цей номер уже зареєстрований. Будь ласка, увійдіть' 
                                            : 'Этот номер уже зарегистрирован. Пожалуйста, войдите';
                                        formik.setFieldError('phone', msg);
                                    }
                                } catch (e) {
                                    console.error('Phone check error:', e);
                                }
                            }
                        }}
                        error={
                            !phoneVerified && formik.errors.phone
                                ? formik.errors.phone === 'Підтвердіть номер телефону через SMS' && formik.submitCount === 0
                                    ? undefined
                                    : formik.errors.phone
                                : undefined
                        }
                        touched={formik.touched.phone}
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
                                                : 'Отримати смс'}
                                </button>
                            </div>

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
                    className={s.inputFieldWrapper}
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
                    className={s.inputFieldWrapper}
                />

                {formik.status && <div className={s.error}>{formik.status}</div>}

                <Button
                    type="submit"
                    className={s.submitBtn}
                    disabled={formik.isSubmitting}
                    variant="red"
                >
                    {formik.isSubmitting ? 'Зачекайте...' : 'ЗАРЕЄСТРУВАТИСЬ'}
                </Button>

                <div className={s.switchText}>
                    <button type="button" className={s.switchLink} onClick={onSwitchToLogin}>
                        Вхід
                    </button>
                </div>

                <GoogleAuthButton
                    onSuccess={(user) => {
                        dispatch(login(user));
                        onSuccess();
                    }}
                />
            </form>
        </>
    );
}
