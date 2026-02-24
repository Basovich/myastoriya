'use client';

import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch } from '@/store/hooks';
import { login } from '@/store/slices/authSlice';
import { usePhoneMask } from '@/hooks/usePhoneMask';
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

                <button type="button" className={s.googleBtn}>
                    <svg className={s.googleIcon} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4.61559 5.43319C5.39247 4.41119 6.62066 3.75 8.00053 3.75C9.13572 3.75 10.203 4.19206 11.0057 4.99478L11.3372 5.32622L13.9888 2.67459L13.6574 2.34316C12.1464 0.832156 10.1374 0 8.00053 0C5.86366 0 3.85469 0.832156 2.34366 2.34313C2.2065 2.48031 2.07509 2.62169 1.94922 2.76678L4.61559 5.43319Z" fill="black"/>
                        <path d="M13.2332 14.051C13.3783 13.9251 13.5197 13.7937 13.6569 13.6565C15.1678 12.1455 16 10.1365 16 7.99964C16 7.51292 15.9559 7.0253 15.869 6.55036L15.7987 6.16602H7.53125V9.91602H11.7954C11.5005 10.5027 11.0786 11.0029 10.5704 11.3882L13.2332 14.051Z" fill="black"/>
                        <path d="M9.73809 11.8811C9.204 12.1193 8.61475 12.2496 8.00053 12.2496C6.62066 12.2496 5.39247 11.5884 4.61559 10.5664L1.94922 13.2328C2.07509 13.3779 2.2065 13.5193 2.34366 13.6564C3.85469 15.1674 5.86366 15.9996 8.00053 15.9996C9.62291 15.9996 11.1713 15.5195 12.4843 14.6272L9.73809 11.8811Z" fill="black"/>
                        <path d="M4.12072 9.73469C3.88263 9.20453 3.75 8.61716 3.75 7.99934C3.75 7.38153 3.88263 6.79416 4.12072 6.264L1.37234 3.51562C0.480094 4.82859 0 6.37697 0 7.99934C0 9.62172 0.480094 11.1701 1.37234 12.4831L4.12072 9.73469Z" fill="black"/>
                    </svg>
                    <span className={s.googleBtnText}>УВІЙТИ ЧЕРЕЗ GOOGLE</span>
                </button>
            </form>
        </>
    );
}
