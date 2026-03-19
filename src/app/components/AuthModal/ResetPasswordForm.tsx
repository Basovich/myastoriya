'use client';

import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import * as Yup from 'yup';
import clsx from 'clsx';
import { useAppDispatch } from '@/store/hooks';
import { login } from '@/store/slices/authSlice';
import s from './AuthModal.module.scss';
import Button from "@/app/components/ui/Button/Button";
import InputField from '@/app/components/ui/InputField';

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
    const dispatch = useAppDispatch();
    const formik = useFormik({
        initialValues: {
            password: '',
            confirmPassword: '',
        },
        validationSchema: resetSchema,
        onSubmit: async (values, { setStatus }) => {
            try {
                await resetPasswordAPI(phone, values.password);
                dispatch(login({
                    phone,
                    email: `${phone.slice(-4)}@myastoriya.ua`,
                    name: 'Користувач',
                }));
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
                <InputField
                    id="reset-password"
                    type="password"
                    name="password"
                    autoComplete="new-password"
                    readOnly
                    onFocus={(e) => {
                        e.currentTarget.removeAttribute('readonly');
                        formik.setFieldTouched('password', false);
                    }}
                    label="Новий пароль"
                    required
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.errors.password}
                    touched={formik.touched.password}
                />

                {/* Confirm password */}
                <InputField
                    id="reset-confirm-password"
                    type="password"
                    name="confirmPassword"
                    autoComplete="new-password"
                    readOnly
                    onFocus={(e) => {
                        e.currentTarget.removeAttribute('readonly');
                        formik.setFieldTouched('confirmPassword', false);
                    }}
                    label="Підтвердити пароль"
                    required
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.errors.confirmPassword}
                    touched={formik.touched.confirmPassword}
                />

                {formik.status && <div className={s.error}>{formik.status}</div>}

                <Button type="submit"
                        className={s.submitBtn}
                        disabled={formik.isSubmitting}
                        variant='red'
                >
                    {formik.isSubmitting ? 'Зачекайте...' : 'Зберегти'}
                </Button>

                <div className={s.switchText}>
                    <button type="button" className={s.switchLink} onClick={onBack}>
                        Повернутись
                    </button>
                </div>
            </form>
        </>
    );
}
