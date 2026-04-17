'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch } from '@/store/hooks';
import { login } from '@/store/slices/authSlice';
import { sendSmsApi, smsVerifyApi, updateUserDataApi, checkUserPhoneApi } from '@/lib/graphql/queries/auth';
import { setAuthCookies, getAccessToken } from '@/app/actions/authActions';
import { usePhoneMask } from '@/hooks/usePhoneMask';
import { GraphQLError } from '@/lib/graphql/client';
import s from './AuthModal.module.scss';
import Button from '@/app/components/ui/Button/Button';
import InputField from '@/app/components/ui/InputField';
import clsx from 'clsx';
import { PHONE_REGEX } from '@/lib/utils/phone';

const COUNTDOWN_SECONDS = 60;

interface CompleteSocialProfileFormProps {
    googleProfile: {
        name?: string;
        surname?: string;
        phone?: string;
        email?: string;
        gender?: string;
    };
    onSuccess: () => void;
    onBack?: () => void;
}

export default function CompleteSocialProfileForm({ googleProfile, onSuccess, onBack }: CompleteSocialProfileFormProps) {
    const dispatch = useAppDispatch();
    const params = useParams();
    const locale = (params?.lang as string) || 'ua';

    const [phoneVerified, setPhoneVerified] = useState(false);
    const phoneVerifiedRef = useRef(false);
    const [smsToken, setSmsToken] = useState('');
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

    const schema = Yup.object({
        name: Yup.string().required('Обов\'язкове поле').min(2, 'Мінімум 2 символи'),
        surname: Yup.string().required('Обов\'язкове поле').min(2, 'Мінімум 2 символи'),
        phone: Yup.string()
            .required('Обов\'язкове поле')
            .matches(PHONE_REGEX, 'Введіть повний номер: +38 (0XX) XXX XX XX')
            .test('phone-verified', 'Підтвердіть номер телефону через SMS', () => phoneVerifiedRef.current),
    });

    const formik = useFormik({
        initialValues: {
            name: googleProfile.name || '',
            surname: googleProfile.surname || '',
            phone: googleProfile.phone || '',
        },
        validationSchema: schema,
        onSubmit: async (values, { setStatus }) => {
            try {
                const token = await getAccessToken();
                if (!token) throw new Error('Unauthorized');

                const updatedUser = await updateUserDataApi({
                    name: values.name,
                    surname: values.surname,
                    phone: values.phone,
                    email: googleProfile.email,
                    sex: googleProfile.gender || 'male',
                }, token, locale);

                dispatch(login({
                    id: updatedUser.id,
                    name: updatedUser.name,
                    surname: updatedUser.surname,
                    phone: updatedUser.phone,
                    email: updatedUser.email,
                    birthday: updatedUser.birthday,
                    gender: updatedUser.sex as any,
                }));
                onSuccess();
            } catch (err) {
                setStatus(err instanceof Error ? err.message : 'Помилка збереження даних');
            }
        },
    });

    useEffect(() => {
        phoneVerifiedRef.current = phoneVerified;
    }, [phoneVerified]);

    const handlePhoneRawChange = useCallback((raw: string) => {
        formik.setFieldValue('phone', raw);
        setPhoneVerified(false);
        phoneVerifiedRef.current = false;
        setSmsRequested(false);
    }, [formik]);

    const { formatted: phoneFormatted, handleChange: handlePhoneChange, handleFocus: handlePhoneFocus } = usePhoneMask(
        formik.values.phone,
        handlePhoneRawChange,
    );

    const handleSendSms = async () => {
        setSmsError('');
        setSmsSending(true);
        try {
            const result = await sendSmsApi(formik.values.phone, locale);
            setSmsToken(result.token);
            if (result.code) console.info('[SMS DEV] Code:', result.code);
            setSmsRequested(true);
            setSmsCode('');
            startCountdown();
        } catch (err) {
            setSmsError(err instanceof Error ? err.message : 'Помилка');
        } finally {
            setSmsSending(false);
        }
    };

    const handleVerifySms = async () => {
        setSmsVerifying(true);
        try {
            await smsVerifyApi(smsToken, smsCode.trim(), locale);
            setPhoneVerified(true);
            phoneVerifiedRef.current = true;
            stopCountdown();
            setCountdown(0);
            setSmsRequested(false);
            setSmsCode('');
        } catch (err) {
            setSmsError(err instanceof Error ? err.message : 'Невірний код');
        } finally {
            setSmsVerifying(false);
        }
    };

    return (
        <>
            <h2 className={s.title}>Завершення реєстрації</h2>
            <p className={s.subtitle}>Будь ласка, вкажіть контактні дані для завершення профілю</p>
            <form className={s.form} onSubmit={formik.handleSubmit}>
                <InputField
                    id="social-name"
                    label="Ім'я"
                    name="name"
                    required
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.errors.name}
                    touched={formik.touched.name}
                />
                <InputField
                    id="social-surname"
                    label="Прізвище"
                    name="surname"
                    required
                    value={formik.values.surname}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.errors.surname}
                    touched={formik.touched.surname}
                />
                <div className={s.field}>
                    <InputField
                        id="social-phone"
                        label="Телефон"
                        name="phone"
                        required
                        value={phoneFormatted}
                        onChange={handlePhoneChange}
                        onFocus={handlePhoneFocus}
                        className={clsx(phoneVerified && s.inputVerified)}
                        error={!phoneVerified && formik.touched.phone ? formik.errors.phone : undefined}
                        touched={formik.touched.phone}
                    />
                    {phoneVerified && (
                        <span className={s.verifiedBadge}>Номер підтверджено</span>
                    )}
                    {PHONE_REGEX.test(formik.values.phone) && !phoneVerified && (
                        <div className={s.smsBlock}>
                            <div className={s.smsInputRow}>
                                <input
                                    type="text"
                                    className={s.smsInput}
                                    placeholder="Код"
                                    value={smsCode}
                                    onChange={(e) => setSmsCode(e.target.value)}
                                    disabled={!smsRequested}
                                />
                                <button
                                    type="button"
                                    className={s.smsSendBtn}
                                    onClick={smsRequested ? handleVerifySms : handleSendSms}
                                    disabled={smsSending || smsVerifying}
                                >
                                    {smsRequested ? 'Підтвердити' : 'Отримати код'}
                                </button>
                            </div>
                            {countdown > 0 && <p className={s.timerText}>Зачекайте {countdown}с</p>}
                            {smsError && <span className={s.fieldError}>{smsError}</span>}
                        </div>
                    )}
                </div>

                {formik.status && <div className={s.error}>{formik.status}</div>}

                <Button type="submit" className={s.submitBtn} variant="red" disabled={formik.isSubmitting || !phoneVerified}>
                    ЗАВЕРШИТИ
                </Button>

                {onBack && (
                    <button type="button" className={s.switchLink} onClick={onBack}>
                        Назад
                    </button>
                )}
            </form>
        </>
    );
}
