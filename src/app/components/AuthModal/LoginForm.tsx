'use client';

import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import * as Yup from 'yup';
import { useAppDispatch } from '@/store/hooks';
import { login } from '@/store/slices/authSlice';
import { usePhoneMask } from '@/hooks/usePhoneMask';
import s from './AuthModal.module.scss';
import GoogleAuthButton from './GoogleAuthButton';

// Stub API function — ready for real API integration
async function loginAPI(phone: string, password: string) {
    // TODO: Replace with actual API call
    return new Promise<{ email: string; phone: string; name: string }>((resolve, reject) => {
        setTimeout(() => {
            if (phone && password) {
                resolve({
                    email: `${phone.replace(/\D/g, '').slice(-4)}@myastoriya.ua`,
                    phone,
                    name: 'Користувач',
                });
            } else {
                reject(new Error('Невірний телефон або пароль'));
            }
        }, 500);
    });
}

const loginSchema = Yup.object({
    phone: Yup.string()
        .required('Обов\'язкове поле')
        .matches(/^380\d{9}$/, 'Введіть повний номер: +38 (0XX) XXX XX XX'),
    password: Yup.string()
        .required('Обов\'язкове поле')
        .min(4, 'Мінімум 4 символи'),
});

interface LoginFormProps {
    onSwitchToRegister: () => void;
    onSuccess: () => void;
}

export default function LoginForm({ onSwitchToRegister, onSuccess }: LoginFormProps) {
    const dispatch = useAppDispatch();
    const router = useRouter();

    const formik = useFormik({
        initialValues: {
            phone: '',
            password: '',
        },
        validationSchema: loginSchema,
        onSubmit: async (values, { setStatus }) => {
            try {
                const user = await loginAPI(values.phone, values.password);
                dispatch(login(user));
                onSuccess();
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Помилка входу';
                setStatus(errorMessage);
            }
        },
    });

    const { formatted: phoneFormatted, handleChange: handlePhoneChange } = usePhoneMask(
        formik.values.phone,
        (raw) => formik.setFieldValue('phone', raw),
    );

    return (
        <>
            <h2 className={s.title}>Вхід до кабінету</h2>
            <form className={s.form} onSubmit={formik.handleSubmit} noValidate autoComplete="off">
                <div className={s.field}>
                    <input
                        id="login-phone"
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
                    <label htmlFor="login-phone" className={s.inputLabel}>Телефон*</label>
                    {formik.touched.phone && formik.errors.phone && (
                        <span className={s.fieldError}>{formik.errors.phone}</span>
                    )}
                </div>

                <div className={s.field}>
                    <input
                        id="login-password"
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
                    <label htmlFor="login-password" className={s.inputLabel}>Пароль*</label>
                    {formik.touched.password && formik.errors.password && (
                        <span className={s.fieldError}>{formik.errors.password}</span>
                    )}
                </div>

                <a href="#" className={s.forgotLink}>Забули пароль?</a>

                {formik.status && <div className={s.error}>{formik.status}</div>}

                <button type="submit" className={s.submitBtn} disabled={formik.isSubmitting}>
                    {formik.isSubmitting ? 'Зачекайте...' : 'УВІЙТИ'}
                </button>

                <div className={s.switchText}>
                    <button type="button" className={s.switchLink} onClick={onSwitchToRegister}>
                        Пройти реєстрацію
                    </button>
                </div>

                <div className={s.divider}>або</div>

                <GoogleAuthButton onSuccess={(user) => {
                    console.log('Logged in via Google:', user);
                    dispatch(login(user));
                    router.push('/personal/profile/');
                    onSuccess();
                }} />
            </form>
        </>
    );
}
