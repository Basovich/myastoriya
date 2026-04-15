'use client';

import { useFormik } from 'formik';
import { useParams } from 'next/navigation';
import * as Yup from 'yup';
import { useAppDispatch } from '@/store/hooks';
import { login } from '@/store/slices/authSlice';
import { loginApi, checkUserPhoneApi } from '@/lib/graphql/queries/auth';
import { setAuthCookies } from '@/app/actions/authActions';
import { usePhoneMask } from '@/hooks/usePhoneMask';
import { GraphQLError } from '@/lib/graphql/client';
import s from './AuthModal.module.scss';
import GoogleAuthButton from './GoogleAuthButton';
import Button from '@/app/components/ui/Button/Button';
import InputField from '@/app/components/ui/InputField';

const loginSchema = Yup.object({
    phone: Yup.string()
        .required('Обов\'язкове поле')
        .matches(/^380\d{9}$/, 'Введіть повний номер: +38 (0XX) XXX XX XX'),
    password: Yup.string()
        .required('Обов\'язкове поле')
        .min(4, 'Мінімум 4 символи'),
});

const authErrors = {
    ua: {
        invalidCredentials: "Невірний номер телефону або пароль",
        generic: "Помилка входу"
    },
    ru: {
        invalidCredentials: "Неверный номер телефона или пароль",
        generic: "Ошибка входа"
    }
};

interface LoginFormProps {
    onSwitchToRegister: () => void;
    onForgotPassword: () => void;
    onSuccess: () => void;
}

export default function LoginForm({ onSwitchToRegister, onForgotPassword, onSuccess }: LoginFormProps) {
    const dispatch = useAppDispatch();
    const params = useParams();
    const lang = (params?.lang as string) || 'ua';

    const formik = useFormik({
        initialValues: {
            phone: '',
            password: '',
        },
        validationSchema: loginSchema,
        onSubmit: async (values, { setStatus }) => {
            try {
                // Final check before login
                const exists = await checkUserPhoneApi(values.phone, lang);
                if (!exists) {
                    const errorDict = authErrors[lang as keyof typeof authErrors] || authErrors.ua;
                    setStatus(lang === 'ua' ? 'Користувача з таким номером не знайдено' : 'Пользователь с таким номером не найден');
                    return;
                }

                const result = await loginApi(
                    { phone: values.phone, password: values.password },
                    lang,
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
                if (err instanceof GraphQLError) {
                    const isInvalidCredentials = err.errors.some(e => 
                        e.extensions?.error_code === 21 || e.extensions?.error_code === '21' ||
                        e.extensions?.error_code === 20 || e.extensions?.error_code === '20'
                    );
                    if (isInvalidCredentials) {
                        const errorDict = authErrors[lang as keyof typeof authErrors] || authErrors.ua;
                        setStatus(errorDict.invalidCredentials);
                        return;
                    }
                }
                const errorDict = authErrors[lang as keyof typeof authErrors] || authErrors.ua;
                const errorMessage = err instanceof Error ? err.message : errorDict.generic;
                setStatus(errorMessage);
            }
        },
    });

    const { formatted: phoneFormatted, handleChange: handlePhoneChange, handleFocus: handlePhoneFocus } = usePhoneMask(
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
                        handlePhoneFocus();
                    }}
                    label="Телефон"
                    required
                    value={phoneFormatted}
                    onChange={handlePhoneChange}
                    onBlur={async () => {
                        formik.setFieldTouched('phone', true);
                        if (/^380\d{9}$/.test(formik.values.phone)) {
                            try {
                                const exists = await checkUserPhoneApi(formik.values.phone, lang);
                                if (!exists) {
                                    formik.setFieldError('phone', lang === 'ua' ? 'Користувача не знайдено' : 'Пользователь не найден');
                                }
                            } catch (e) {
                                console.error('Phone check error:', e);
                            }
                        }
                    }}
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

                <button type="button" className={s.forgotLink} onClick={onForgotPassword}>
                    Забули пароль?
                </button>

                {formik.status && <div className={s.error}>{formik.status}</div>}

                <Button
                    type="submit"
                    className={s.submitBtn}
                    disabled={formik.isSubmitting}
                    variant="red"
                >
                    {formik.isSubmitting ? 'Зачекайте...' : 'УВІЙТИ'}
                </Button>

                <div className={s.switchText}>
                    <button type="button" className={s.switchLink} onClick={onSwitchToRegister}>
                        Пройти реєстрацію
                    </button>
                </div>

                <div className={s.divider}>або</div>

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
