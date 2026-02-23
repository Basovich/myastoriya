'use client';

import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch } from '@/store/hooks';
import { login } from '@/store/slices/authSlice';
import s from './AuthModal.module.scss';

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
        .matches(/^\+?\d{10,13}$/, 'Невірний формат телефону'),
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
            } catch (err: any) {
                setStatus(err.message || 'Помилка входу');
            }
        },
    });

    return (
        <>
            <h2 className={s.title}>Вхід до кабінету</h2>
            <form className={s.form} onSubmit={formik.handleSubmit} noValidate>
                <div className={s.field}>
                    <input
                        type="tel"
                        name="phone"
                        className={`${s.input} ${formik.touched.phone && formik.errors.phone ? s.inputError : ''}`}
                        placeholder="Телефон"
                        value={formik.values.phone}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                    />
                    <label className={s.inputLabel}>Телефон*</label>
                    {formik.touched.phone && formik.errors.phone && (
                        <span className={s.fieldError}>{formik.errors.phone}</span>
                    )}
                </div>

                <div className={s.field}>
                    <input
                        type="password"
                        name="password"
                        className={`${s.input} ${formik.touched.password && formik.errors.password ? s.inputError : ''}`}
                        placeholder="Пароль"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                    />
                    <label className={s.inputLabel}>Пароль*</label>
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

                <button type="button" className={s.googleBtn}>
                    <span className={s.googleIcon}>G</span>
                    УВІЙТИ ЧЕРЕЗ GOOGLE
                </button>
            </form>
        </>
    );
}
