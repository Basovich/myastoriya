'use client';

import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import * as Yup from 'yup';
import { useAppDispatch } from '@/store/hooks';
import { login } from '@/store/slices/authSlice';
import { usePhoneMask } from '@/hooks/usePhoneMask';
import s from './AuthModal.module.scss';
import GoogleAuthButton from './GoogleAuthButton';
import Button from "@/app/components/ui/Button/Button";
import InputField from '@/app/components/ui/InputField';

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
    onForgotPassword: () => void;
    onSuccess: () => void;
}

export default function LoginForm({ onSwitchToRegister, onForgotPassword, onSuccess }: LoginFormProps) {
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
                <InputField
                    id="login-phone"
                    type="tel"
                    name="phone"
                    autoComplete="off"
                    readOnly
                    onFocus={(e) => {
                        e.currentTarget.removeAttribute('readonly');
                        formik.setFieldTouched('phone', false);
                    }}
                    label="Телефон"
                    required
                    value={phoneFormatted}
                    onChange={handlePhoneChange}
                    onBlur={() => formik.setFieldTouched('phone', true)}
                    error={formik.errors.phone}
                    touched={formik.touched.phone}
                />

                <InputField
                    id="login-password"
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

                <button type="button" className={s.forgotLink} onClick={onForgotPassword}>Забули пароль?</button>

                {formik.status && <div className={s.error}>{formik.status}</div>}

                <Button type="submit"
                        className={s.submitBtn}
                        disabled={formik.isSubmitting}
                        variant='red'
                >
                    {formik.isSubmitting ? 'Зачекайте...' : 'УВІЙТИ'}
                </Button>

                <div className={s.switchText}>
                    <button type="button" className={s.switchLink} onClick={onSwitchToRegister}>
                        Пройти реєстрацію
                    </button>
                </div>

                <div className={s.divider}>або</div>

                <GoogleAuthButton onSuccess={(user) => {
                    console.log('Logged in via Google:', user);
                    dispatch(login(user));
                    onSuccess();
                }} />
            </form>
        </>
    );
}
