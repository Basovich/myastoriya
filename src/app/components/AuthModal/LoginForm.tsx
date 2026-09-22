'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch } from '@/store/hooks';
import { login } from '@/store/slices/authSlice';
import { authCodeRequestApi, authByCodeApi } from '@/lib/graphql/queries/auth';
import { setAuthCookies } from '@/app/actions/authActions';
import { usePhoneMask } from '@/hooks/usePhoneMask';
import { getOrCreateDeviceId } from '@/lib/utils/auth';
import { GraphQLError } from '@/lib/graphql/client';
import * as Sentry from '@sentry/nextjs';
import s from './AuthModal.module.scss';
import GoogleAuthButton from './GoogleAuthButton';
import Button from '@/app/components/ui/Button/Button';
import InputField from '@/app/components/ui/InputField';
import { PHONE_REGEX } from '@/lib/utils/phone';

interface LoginFormProps {
    onSwitchToRegister: () => void;
    onIncompleteProfile: (profile: unknown) => void;
    onSuccess: () => void;
}

export default function LoginForm({ onSwitchToRegister, onIncompleteProfile, onSuccess }: LoginFormProps) {
    const dispatch = useAppDispatch();
    const params = useParams();
    const lang = (params?.lang as string) || 'ua';

    const [authChallengeToken, setAuthChallengeToken] = useState('');
    const [smsCode, setSmsCode] = useState('');
    const [codeSent, setCodeSent] = useState(false);
    const [isSendingCode, setIsSendingCode] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [statusError, setStatusError] = useState('');
    const [statusInfo, setStatusInfo] = useState('');
    const [needsName, setNeedsName] = useState(false);

    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const stopCountdown = useCallback(() => {
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }
    }, []);

    const startCountdown = useCallback((seconds: number) => {
        stopCountdown();
        const startSec = seconds > 0 ? seconds : 60;
        setCountdown(startSec);
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

    const loginSchema = Yup.object({
        phone: Yup.string()
            .required(lang === 'ua' ? 'Обов\'язкове поле' : 'Обязательное поле')
            .matches(/^380\d{9}$/, lang === 'ua' ? 'Введіть повний номер: +38 (0XX) XXX XX XX' : 'Введите полный номер: +38 (0XX) XXX XX XX'),
        name: Yup.string().when('needsName', {
            is: true,
            then: (schema) => schema.required(lang === 'ua' ? 'Обов\'язкове поле' : 'Обязательное поле').min(2, lang === 'ua' ? 'Мінімум 2 символи' : 'Минимум 2 символа'),
            otherwise: (schema) => schema.optional(),
        }),
    });

    const formik = useFormik({
        initialValues: {
            phone: '',
            name: '',
        },
        validationSchema: loginSchema,
        onSubmit: async (values, { setSubmitting }) => {
            if (!codeSent || smsCode.trim().length < 4) return;
            setStatusError('');
            setStatusInfo('');

            try {
                const deviceId = getOrCreateDeviceId();
                const result = await authByCodeApi({
                    token: authChallengeToken,
                    code: parseInt(smsCode.trim(), 10),
                    name: needsName ? (values.name || 'Користувач') : undefined,
                    surname: needsName ? (values.name || 'Користувач') : undefined,
                    deviceId,
                }, lang);

                await setAuthCookies(result.accessToken, result.refreshToken);
                dispatch(
                    login({
                        id: result.user.id,
                        name: result.user.name,
                        surname: result.user.surname,
                        patronymic: result.user.patronymic,
                        phone: result.user.phone,
                        email: result.user.email,
                        birthday: result.user.birthday,
                        sex: result.user.sex,
                        token: result.accessToken,
                        bonuses: result.user.bonuses,
                    }),
                );
                onSuccess();
            } catch (err: unknown) {
                Sentry.captureException(err, { tags: { category: 'auth', action: 'authByCode' } });
                let msg = lang === 'ua' ? 'Помилка підтвердження коду' : 'Ошибка подтверждения кода';

                if (err instanceof GraphQLError && err.errors.length > 0) {
                    const firstErr = err.errors[0];
                    const errorCode = firstErr.extensions?.error_code;

                    switch (errorCode) {
                        case 200:
                        case '200':
                            msg = lang === 'ua' ? 'Не вдалося відправити код. Спробуйте пізніше' : 'Не удалось отправить код. Попробуйте позже';
                            break;
                        case 201:
                        case '201':
                            msg = lang === 'ua' ? 'Код вже надіслано' : 'Код уже отправлен';
                            break;
                        case 202:
                        case '202':
                            msg = lang === 'ua' ? 'Вичерпано ліміт відправок на цей номер' : 'Исчерпан лимит отправок на этот номер';
                            break;
                        case 203:
                        case '203':
                        case 204:
                        case '204':
                        case 206:
                        case '206':
                            msg = lang === 'ua' ? 'Термін дії коду закінчився. Запросіть код повторно' : 'Срок действия кода истек. Запросите код заново';
                            setCodeSent(false);
                            setSmsCode('');
                            break;
                        case 205:
                        case '205':
                            msg = lang === 'ua' ? 'Невірний код. Спробуйте ще раз' : 'Неверный код. Попробуйте еще раз';
                            break;
                        case 207:
                        case '207':
                            msg = lang === 'ua' ? 'Номер не зареєстрований. Будь ласка, вкажіть ваше ім\'я' : 'Номер не зарегистрирован. Пожалуйста, укажите ваше имя';
                            setNeedsName(true);
                            break;
                        case 208:
                        case '208':
                            msg = lang === 'ua' ? 'Акаунт з цим номером заблоковано. Зверніться до підтримки' : 'Аккаунт с этим номером заблокирован. Обратитесь в поддержку';
                            break;
                        default:
                            if (firstErr.message) msg = firstErr.message;
                    }
                } else if (err instanceof Error) {
                    msg = err.message;
                }

                setStatusError(msg);
            } finally {
                setSubmitting(false);
            }
        },
    });

    const handleSendCode = async () => {
        if (!PHONE_REGEX.test(formik.values.phone) || isSendingCode || countdown > 0) return;
        setStatusError('');
        setStatusInfo('');
        setIsSendingCode(true);

        try {
            const challenge = await authCodeRequestApi(formik.values.phone, lang);
            setAuthChallengeToken(challenge.token);
            setCodeSent(true);

            if (challenge.code) {
                console.info('[SMS DEV] Code:', challenge.code);
            }

            if (!challenge.isRegistered) {
                setNeedsName(true);
            } else {
                setNeedsName(false);
            }

            startCountdown(challenge.resendAfter || 60);
            setStatusInfo(lang === 'ua' ? 'Код надіслано' : 'Код отправлен');
        } catch (err: unknown) {
            Sentry.captureException(err, { tags: { category: 'auth', action: 'authCodeRequest' } });
            let msg = lang === 'ua' ? 'Помилка відправки коду' : 'Ошибка отправки кода';

            if (err instanceof GraphQLError && err.errors.length > 0) {
                const firstErr = err.errors[0];
                const errorCode = firstErr.extensions?.error_code;

                switch (errorCode) {
                    case 200:
                    case '200':
                        msg = lang === 'ua' ? 'Не вдалося відправити код. Спробуйте пізніше' : 'Не удалось отправить код. Попробуйте позже';
                        break;
                    case 201:
                    case '201':
                        msg = lang === 'ua' ? 'Код вже надіслано' : 'Код уже отправлен';
                        break;
                    case 202:
                    case '202':
                        msg = lang === 'ua' ? 'Вичерпано ліміт відправок на цей номер' : 'Исчерпан лимит отправок на этот номер';
                        break;
                    case 208:
                    case '208':
                        msg = lang === 'ua' ? 'Акаунт з цим номером заблоковано. Зверніться до підтримки' : 'Аккаунт с этим номером заблокирован. Обратитесь в поддержку';
                        break;
                    default:
                        if (firstErr.message && firstErr.message !== 'Internal server error') {
                            msg = firstErr.message;
                        }
                }
            } else if (err instanceof Error && err.message !== 'Internal server error') {
                msg = err.message;
            }

            setStatusError(msg);
        } finally {
            setIsSendingCode(false);
        }
    };

    const { formatted: phoneFormatted, handleChange: handlePhoneChange, handleFocus: handlePhoneFocus } = usePhoneMask(
        formik.values.phone,
        (raw) => {
            formik.setFieldValue('phone', raw);
            setCodeSent(false);
            setSmsCode('');
            setStatusError('');
            setStatusInfo('');
            stopCountdown();
        },
    );

    const isPhoneValid = PHONE_REGEX.test(formik.values.phone);
    const isSubmitDisabled = formik.isSubmitting || !codeSent || smsCode.trim().length < 4 || (needsName && !formik.values.name.trim());

    return (
        <>
            <h2 className={s.title}>{lang === 'ua' ? 'ВХІД ДО КАБІНЕТУ' : 'ВХОД В КАБИНЕТ'}</h2>
            <form className={s.form} onSubmit={formik.handleSubmit} noValidate autoComplete="off">
                <InputField
                    id="login-phone"
                    type="tel"
                    name="phone"
                    autoComplete="off"
                    readOnly
                    onFocus={(e) => {
                        e.currentTarget.removeAttribute('readonly');
                        formik.setFieldTouched('phone', false);
                        handlePhoneFocus();
                    }}
                    label={lang === 'ua' ? 'Телефон' : 'Телефон'}
                    required
                    value={phoneFormatted}
                    onChange={handlePhoneChange}
                    onBlur={() => formik.setFieldTouched('phone', true)}
                    error={formik.errors.phone}
                    touched={formik.touched.phone}
                />

                {isPhoneValid && (
                    <div className={s.smsBlock}>
                        <div className={s.smsInputRow}>
                            <input
                                type="text"
                                className={s.smsInput}
                                placeholder={lang === 'ua' ? 'Введіть код з СМС' : 'Введите код из СМС'}
                                value={smsCode}
                                onChange={(e) => {
                                    setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                                    if (statusError) setStatusError('');
                                }}
                                maxLength={6}
                            />
                            <button
                                type="button"
                                className={s.smsSendBtn}
                                onClick={handleSendCode}
                                disabled={isSendingCode || countdown > 0}
                            >
                                {isSendingCode
                                    ? (lang === 'ua' ? 'Надсилання...' : 'Отправка...')
                                    : (lang === 'ua' ? 'Отримати смс' : 'Получить смс')}
                            </button>
                        </div>

                        {countdown > 0 ? (
                            <div className={s.timerText} style={{ marginTop: '8px' }}>
                                {lang === 'ua' ? 'Відправити код повторно можна буде через: ' : 'Отправить код повторно можно будет через: '}
                                <span className={s.timerCount}>{countdown}</span>
                            </div>
                        ) : (
                            codeSent && (
                                <button
                                    type="button"
                                    className={s.forgotLink}
                                    onClick={handleSendCode}
                                    style={{ alignSelf: 'center', marginTop: '8px' }}
                                >
                                    {lang === 'ua' ? 'Відправити код повторно' : 'Отправить код повторно'}
                                </button>
                            )
                        )}
                    </div>
                )}

                {needsName && (
                    <InputField
                        id="login-name"
                        type="text"
                        name="name"
                        autoComplete="off"
                        label={lang === 'ua' ? 'Ім\'я' : 'Имя'}
                        required
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.errors.name}
                        touched={formik.touched.name}
                        className={s.inputFieldWrapper}
                    />
                )}

                {statusInfo && <div className={s.info} style={{ marginTop: '8px', fontSize: '12px', color: '#2a9d5c', textAlign: 'center' }}>{statusInfo}</div>}
                {statusError && <div className={s.error} style={{ marginTop: '8px' }}>{statusError}</div>}

                <Button
                    type="submit"
                    className={s.submitBtn}
                    disabled={isSubmitDisabled}
                    variant="red"
                >
                    {formik.isSubmitting ? (lang === 'ua' ? 'Зачекайте...' : 'Подождите...') : (lang === 'ua' ? 'УВІЙТИ' : 'ВОЙТИ')}
                </Button>

                <div className={s.switchText}>
                    <button type="button" className={s.switchLink} onClick={onSwitchToRegister}>
                        {lang === 'ua' ? 'Пройти реєстрацію' : 'Пройти регистрацию'}
                    </button>
                </div>

                <div className={s.divider}>{lang === 'ua' ? 'або' : 'или'}</div>

                <GoogleAuthButton
                    onSuccess={(user) => {
                        dispatch(login({ ...user, token: user.token }));
                        onSuccess();
                    }}
                    onIncompleteProfile={onIncompleteProfile}
                />
            </form>
        </>
    );
}
