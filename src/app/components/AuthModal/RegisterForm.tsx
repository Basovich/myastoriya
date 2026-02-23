'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch } from '@/store/hooks';
import { login } from '@/store/slices/authSlice';
import { usePhoneMask } from '@/hooks/usePhoneMask';
import s from './AuthModal.module.scss';

const VERIFICATION_CODE = '7535'; // Stub code

// Stub API functions — ready for real API integration
async function registerAPI(data: { name: string; phone: string; password: string }) {
    // TODO: Replace with actual API call
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

async function sendVerificationCode(phone: string) {
    // TODO: Replace with actual API call
    return new Promise<void>((resolve) => {
        setTimeout(resolve, 300);
    });
}

async function verifyCode(phone: string, code: string) {
    // TODO: Replace with actual API call
    return new Promise<boolean>((resolve) => {
        setTimeout(() => resolve(code === VERIFICATION_CODE), 300);
    });
}

const registerSchema = Yup.object({
    name: Yup.string()
        .required('Обов\'язкове поле')
        .min(2, 'Мінімум 2 символи'),
    phone: Yup.string()
        .required('Обов\'язкове поле')
        .matches(/^380\d{9}$/, 'Введіть повний номер: +38 (0XX) XXX XX XX'),
    password: Yup.string()
        .required('Обов\'язкове поле')
        .min(6, 'Мінімум 6 символів'),
    confirmPassword: Yup.string()
        .required('Обов\'язкове поле')
        .oneOf([Yup.ref('password')], 'Паролі не збігаються'),
});

interface RegisterFormProps {
    onSwitchToLogin: () => void;
    onSuccess: () => void;
}

type Step = 'form' | 'verify';

export default function RegisterForm({ onSwitchToLogin, onSuccess }: RegisterFormProps) {
    const dispatch = useAppDispatch();
    const [step, setStep] = useState<Step>('form');
    const [apiError, setApiError] = useState('');
    const [verifyLoading, setVerifyLoading] = useState(false);

    // Verification code
    const [code, setCode] = useState(['', '', '', '']);
    const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

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
                await sendVerificationCode(values.phone);
                setStep('verify');
            } catch (err: any) {
                setStatus(err.message || 'Помилка реєстрації');
            }
        },
    });

    const { formatted: phoneFormatted, handleChange: handlePhoneChange } = usePhoneMask(
        formik.values.phone,
        (raw) => formik.setFieldValue('phone', raw),
    );

    const handleCodeChange = (index: number, value: string) => {
        if (value.length > 1) value = value.slice(-1);
        if (!/^\d*$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        if (value && index < 3) {
            codeRefs.current[index + 1]?.focus();
        }
    };

    const handleCodeKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            codeRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        setApiError('');
        setVerifyLoading(true);
        const fullCode = code.join('');

        try {
            const isValid = await verifyCode(formik.values.phone, fullCode);
            if (isValid) {
                dispatch(login({
                    email: `${formik.values.phone.replace(/\D/g, '').slice(-4)}@myastoriya.ua`,
                    phone: formik.values.phone,
                    name: formik.values.name,
                }));
                onSuccess();
            } else {
                setApiError('Невірний код. Спробуйте ще раз.');
                setCode(['', '', '', '']);
                codeRefs.current[0]?.focus();
            }
        } catch (err: any) {
            setApiError(err.message || 'Помилка перевірки');
        } finally {
            setVerifyLoading(false);
        }
    };

    const handleResend = async () => {
        setApiError('');
        await sendVerificationCode(formik.values.phone);
        setCode(['', '', '', '']);
        codeRefs.current[0]?.focus();
    };

    if (step === 'verify') {
        return (
            <div className={s.verifySection}>
                <h2 className={s.title}>Підтвердження</h2>
                <p className={s.verifyText}>
                    Ми надіслали SMS-код на номер<br />
                    <strong>{formik.values.phone}</strong>
                </p>

                <div className={s.codeInputGroup}>
                    {code.map((digit, i) => (
                        <input
                            key={i}
                            ref={(el) => { codeRefs.current[i] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            className={s.codeInput}
                            value={digit}
                            onChange={(e) => handleCodeChange(i, e.target.value)}
                            onKeyDown={(e) => handleCodeKeyDown(i, e)}
                            autoFocus={i === 0}
                        />
                    ))}
                </div>

                {apiError && <div className={s.error}>{apiError}</div>}

                <button
                    type="button"
                    className={s.submitBtn}
                    onClick={handleVerify}
                    disabled={verifyLoading || code.some((d) => !d)}
                >
                    {verifyLoading ? 'Перевірка...' : 'ПІДТВЕРДИТИ'}
                </button>

                <button type="button" className={s.resendLink} onClick={handleResend}>
                    Надіслати код повторно
                </button>
            </div>
        );
    }

    return (
        <>
            <h2 className={s.title}>Реєстрація в кабінеті</h2>
            <form className={s.form} onSubmit={formik.handleSubmit} noValidate autoComplete="off">
                <div className={s.field}>
                    <input
                        id="reg-name"
                        type="text"
                        name="name"
                        autoComplete="off"
                        readOnly
                        onFocus={(e) => {
                            e.currentTarget.removeAttribute('readOnly');
                            formik.setFieldTouched('name', false);
                        }}
                        className={`${s.input} ${formik.touched.name && formik.errors.name ? s.inputError : ''}`}
                        placeholder="Ім'я"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                    />
                    <label htmlFor="reg-name" className={s.inputLabel}>Ім&apos;я*</label>
                    {formik.touched.name && formik.errors.name && (
                        <span className={s.fieldError}>{formik.errors.name}</span>
                    )}
                </div>

                <div className={s.field}>
                    <input
                        id="reg-phone"
                        type="tel"
                        name="phone"
                        autoComplete="off"
                        readOnly
                        onFocus={(e) => {
                            e.currentTarget.removeAttribute('readOnly');
                            formik.setFieldTouched('phone', false);
                        }}
                        className={`${s.input} ${formik.touched.phone && formik.errors.phone ? s.inputError : ''}`}
                        placeholder="+38 (0__) ___ __ __"
                        value={phoneFormatted}
                        onChange={handlePhoneChange}
                        onBlur={() => formik.setFieldTouched('phone', true)}
                    />
                    <label htmlFor="reg-phone" className={s.inputLabel}>Телефон*</label>
                    {formik.touched.phone && formik.errors.phone && (
                        <span className={s.fieldError}>{formik.errors.phone}</span>
                    )}
                </div>

                <div className={s.field}>
                    <input
                        id="reg-password"
                        type="password"
                        name="password"
                        autoComplete="off"
                        readOnly
                        onFocus={(e) => {
                            e.currentTarget.removeAttribute('readOnly');
                            formik.setFieldTouched('password', false);
                        }}
                        className={`${s.input} ${formik.touched.password && formik.errors.password ? s.inputError : ''}`}
                        placeholder="Пароль"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                    />
                    <label htmlFor="reg-password" className={s.inputLabel}>Пароль*</label>
                    {formik.touched.password && formik.errors.password && (
                        <span className={s.fieldError}>{formik.errors.password}</span>
                    )}
                </div>

                <div className={s.field}>
                    <input
                        id="reg-confirm-password"
                        type="password"
                        name="confirmPassword"
                        autoComplete="off"
                        readOnly
                        onFocus={(e) => {
                            e.currentTarget.removeAttribute('readOnly');
                            formik.setFieldTouched('confirmPassword', false);
                        }}
                        className={`${s.input} ${formik.touched.confirmPassword && formik.errors.confirmPassword ? s.inputError : ''}`}
                        placeholder="Повторити пароль"
                        value={formik.values.confirmPassword}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                    />
                    <label htmlFor="reg-confirm-password" className={s.inputLabel}>Повторити пароль*</label>
                    {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                        <span className={s.fieldError}>{formik.errors.confirmPassword}</span>
                    )}
                </div>

                {formik.status && <div className={s.error}>{formik.status}</div>}

                <button type="submit" className={s.submitBtn} disabled={formik.isSubmitting}>
                    {formik.isSubmitting ? 'Зачекайте...' : 'ЗАРЕЄСТРУВАТИСЬ'}
                </button>

                <div className={s.switchText}>
                    <button type="button" className={s.switchLink} onClick={onSwitchToLogin}>
                        Вхід
                    </button>
                </div>

                <button type="button" className={s.googleBtn}>
                    <span className={s.googleIcon}>G</span>
                    РЕЄСТРАЦІЯ ЧЕРЕЗ GOOGLE
                </button>
            </form>
        </>
    );
}
