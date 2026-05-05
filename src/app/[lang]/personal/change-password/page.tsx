'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateUserDataApi } from '@/lib/graphql/queries/auth';
import { setUser } from '@/store/slices/authSlice';
import { getAccessToken } from '@/app/actions/authActions';
import { Locale } from '@/i18n/config';
import ChangePasswordForm, { ChangePasswordFormValues } from '@/app/components/Personal/ChangePasswordForm/ChangePasswordForm';
import s from './ChangePassword.module.scss';

const changePasswordDict = {
  ua: {
    title: "Зміна паролю",
    newPassword: "Повторити пароль",
    confirmNewPassword: "Повторити новий пароль",
    saveButton: "ЗБЕРЕГТИ ЗМІНИ",
    success: "Пароль успішно змінено!",
    error: "Помилка при зміні паролю.",
    unauthorized: "Помилка авторизації. Будь ласка, увійдіть знову."
  },
  ru: {
    title: "Изменение пароля",
    newPassword: "Повторить пароль",
    confirmNewPassword: "Повторить новый пароль",
    saveButton: "СОХРАНИТЬ ИЗМЕНЕНИЯ",
    success: "Пароль успешно изменен!",
    error: "Ошибка при изменении пароля.",
    unauthorized: "Ошибка авторизации. Пожалуйста, войдите снова."
  }
};

export default function ChangePasswordPage() {
    const { user } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const params = useParams();
    const lang = (params?.lang as Locale) || 'ua';
    const dict = changePasswordDict[lang as keyof typeof changePasswordDict];
    
    const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    useEffect(() => {
        if (submitStatus) {
            const timer = setTimeout(() => {
                setSubmitStatus(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [submitStatus]);

    const handleFormSubmit = async (values: ChangePasswordFormValues) => {
        try {
            const token = await getAccessToken();
            if (!token || !user) {
                setSubmitStatus({
                    type: 'error',
                    message: dict.unauthorized
                });
                return;
            }

            // We use updateUserData mutation to change the password.
            // Since it requires all user data, we spread the current user info.
            const updatedUser = await updateUserDataApi(
                {
                    name: user.name || '',
                    surname: user.surname || '',
                    phone: user.phone || '',
                    email: user.email || '',
                    birthday: user.birthday || '',
                    sex: user.sex || 'male',
                    password: values.newPassword, // Send new password
                },
                token,
                lang
            );

            // Update user in Redux store (though password is not stored there)
            dispatch(setUser({
                ...user,
                id: updatedUser.id,
                name: updatedUser.name,
                surname: updatedUser.surname,
                phone: updatedUser.phone,
                email: updatedUser.email,
                birthday: updatedUser.birthday,
                sex: updatedUser.sex,
            }));

            setSubmitStatus({
                type: 'success',
                message: dict.success
            });
        } catch (error) {
            console.error('Change password error:', error);
            setSubmitStatus({
                type: 'error',
                message: dict.error
            });
            throw error; // Let formik know it failed
        }
    };

    return (
        <div className={s.pageWrapper}>
            <ChangePasswordForm 
                user={user} 
                dict={dict} 
                onSubmit={handleFormSubmit}
                submitStatus={submitStatus}
            />
        </div>
    );
}
