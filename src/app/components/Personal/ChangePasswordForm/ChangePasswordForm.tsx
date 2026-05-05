'use client';

import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import InputField from '@/app/components/ui/InputField';
import Button from '@/app/components/ui/Button/Button';
import s from './ChangePasswordForm.module.scss';
import clsx from 'clsx';
import { AuthUser } from '@/store/slices/authSlice';

export interface ChangePasswordFormValues {
    newPassword: string;
    confirmNewPassword: string;
}

interface ChangePasswordFormProps {
    user: AuthUser | null;
    dict: {
        title: string;
        newPassword: string;
        confirmNewPassword: string;
        saveButton: string;
    };
    onSubmit: (values: ChangePasswordFormValues) => Promise<void>;
    submitStatus?: { type: 'success' | 'error'; message: string } | null;
}

export default function ChangePasswordForm({ user, dict, onSubmit, submitStatus }: ChangePasswordFormProps) {
    const validationSchema = Yup.object().shape({
        newPassword: Yup.string()
            .required('Обов\'язкове поле')
            .min(6, 'Мінімум 6 символів'),
        confirmNewPassword: Yup.string()
            .required('Обов\'язкове поле')
            .oneOf([Yup.ref('newPassword')], 'Паролі не збігаються'),
    });

    const formik = useFormik<ChangePasswordFormValues>({
        initialValues: {
            newPassword: '',
            confirmNewPassword: '',
        },
        validationSchema,
        onSubmit: async (values, { resetForm }) => {
            await onSubmit(values);
            if (submitStatus?.type === 'success') {
                resetForm();
            }
        },
    });

    return (
        <div className={s.changePasswordFormContainer}>
            <form className={s.form} onSubmit={formik.handleSubmit}>
                <div className={s.fieldsGrid}>
                    <InputField
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        label={dict.newPassword}
                        value={formik.values.newPassword}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.errors.newPassword}
                        touched={formik.touched.newPassword}
                        required
                        className={s.inputField}
                    />
                    <InputField
                        id="confirmNewPassword"
                        name="confirmNewPassword"
                        type="password"
                        label={dict.confirmNewPassword}
                        value={formik.values.confirmNewPassword}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.errors.confirmNewPassword}
                        touched={formik.touched.confirmNewPassword}
                        required
                        className={s.inputField}
                    />
                </div>

                <div className={s.actions}>
                    <Button 
                        type="submit" 
                        variant="red" 
                        className={s.submitBtn}
                        disabled={formik.isSubmitting}
                    >
                        {formik.isSubmitting ? 'Зберігаємо...' : dict.saveButton}
                    </Button>
                    
                    {submitStatus && (
                        <div className={clsx(s.statusMessage, s[submitStatus.type])}>
                            {submitStatus.message}
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
}
