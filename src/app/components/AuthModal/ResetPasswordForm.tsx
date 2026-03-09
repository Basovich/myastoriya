'use client';

import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import * as Yup from 'yup';
import clsx from 'clsx';
import s from './AuthModal.module.scss';

// Stub API call — replace with real endpoint
async function resetPasswordAPI(phone: string, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (phone && password) {
                resolve();
            } else {
                reject(new Error('Помилка скидання паролю'));
            }
        }, 500);
    });
}

const resetSchema = Yup.object({
    password: Yup.string()
        .required("Обов'язкове поле")
        .min(6, 'Мінімум 6 символів'),
    confirmPassword: Yup.string()
        .required("Обов'язкове поле")
        .oneOf([Yup.ref('password')], 'Паролі не збігаються'),
});

interface ResetPasswordFormProps {
    phone: string;
    onSuccess: () => void;
    onBack: () => void;
}

export default function ResetPasswordForm({ phone, onSuccess, onBack }: ResetPasswordFormProps) {
    const router = useRouter();
    const formik = useFormik({
        initialValues: {
            password: '',
            confirmPassword: '',
        },
        validationSchema: resetSchema,
        onSubmit: async (values, { setStatus }) => {
            try {
                await resetPasswordAPI(phone, values.password);
                onSuccess();
                router.push('/personal/profile/');
            } catch (err) {
                const msg = err instanceof Error ? err.message : 'Помилка скидання паролю';
                setStatus(msg);
            }
        },
    });

    return (
        <>
            <h2 className={s.title}>Новий пароль</h2>
            <form className={s.form} onSubmit={formik.handleSubmit} noValidate autoComplete="off">

                {/* New password */}
                <div className={s.field}>
                    <input
                        id="reset-password"
                        type="password"
                        name="password"
                        autoComplete="new-password"
                        readOnly
                        onFocus={(e) => {
                            e.currentTarget.removeAttribute('readOnly');
                            formik.setFieldTouched('password', false);
                        }}
                        className={clsx(
                            s.input,
                            formik.touched.password && formik.errors.password && s.inputError,
                        )}
                        placeholder="Новий пароль"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                    />
                    <label htmlFor="reset-password" className={s.inputLabel}>
                        Новий пароль<span className={s.required}>*</span>
                    </label>
                    {formik.touched.password && formik.errors.password && (
                        <span className={s.fieldError}>{formik.errors.password}</span>
                    )}
                </div>

                {/* Confirm password */}
                <div className={s.field}>
                    <input
                        id="reset-confirm-password"
                        type="password"
                        name="confirmPassword"
                        autoComplete="new-password"
                        readOnly
                        onFocus={(e) => {
                            e.currentTarget.removeAttribute('readOnly');
                            formik.setFieldTouched('confirmPassword', false);
                        }}
                        className={clsx(
                            s.input,
                            formik.touched.confirmPassword && formik.errors.confirmPassword && s.inputError,
                        )}
                        placeholder="Підтвердити пароль"
                        value={formik.values.confirmPassword}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                    />
                    <label htmlFor="reset-confirm-password" className={s.inputLabel}>
                        Підтвердити пароль<span className={s.required}>*</span>
                    </label>
                    {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                        <span className={s.fieldError}>{formik.errors.confirmPassword}</span>
                    )}
                </div>

                {formik.status && <div className={s.error}>{formik.status}</div>}

                <button type="submit" className={s.submitBtn} disabled={formik.isSubmitting}>
                    {formik.isSubmitting ? 'Зачекайте...' : 'Зберегти'}
                </button>

                <div className={s.switchText}>
                    <button type="button" className={s.switchLink} onClick={onBack}>
                        Повернутись
                    </button>
                </div>
            </form>
        </>
    );
}
