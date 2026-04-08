'use client';

import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import InputField from '@/app/components/ui/InputField';
import Button from '@/app/components/ui/Button/Button';
import s from './ProfileForm.module.scss';
import clsx from 'clsx';
import { AuthUser } from '@/store/slices/authSlice';

interface ProfileFormProps {
    user: AuthUser | null;
    dict: {
        personalDataTitle: string;
        firstName: string;
        lastName: string;
        middleName: string;
        phone: string;
        email: string;
        birthday: string;
        gender: {
            title: string;
            male: string;
            female: string;
        };
        googleAuth: string;
        saveButton: string;
    };
    onSubmit: (values: any) => void;
}

export default function ProfileForm({ user, dict, onSubmit }: ProfileFormProps) {
    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Обов\'язкове поле'),
        surname: Yup.string().required('Обов\'язкове поле'),
        email: Yup.string().email('Некоректний email'),
    });

    const initialValues = {
        name: user?.name || '',
        surname: user?.surname || '',
        middleName: user?.middleName || '',
        phone: user?.phone || '',
        email: user?.email || '',
        birthday: user?.birthday || '',
        gender: user?.gender || 'male',
    };

    return (
        <div className={s.profileFormContainer}>
            <h2 className={s.sectionTitle}>{dict.personalDataTitle}</h2>
            
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
                enableReinitialize
            >
                {({ values, errors, touched, setFieldValue, handleChange }) => (
                    <Form className={s.form}>
                        <div className={s.fieldsGrid}>
                            <InputField
                                id="name"
                                name="name"
                                label={dict.firstName}
                                value={values.name}
                                onChange={handleChange}
                                error={errors.name}
                                touched={touched.name}
                                required
                            />
                            <InputField
                                id="surname"
                                name="surname"
                                label={dict.lastName}
                                value={values.surname}
                                onChange={handleChange}
                                error={errors.surname}
                                touched={touched.surname}
                                required
                            />
                            <InputField
                                id="middleName"
                                name="middleName"
                                label={dict.middleName}
                                value={values.middleName}
                                onChange={handleChange}
                                error={errors.middleName}
                                touched={touched.middleName}
                            />
                            <InputField
                                id="phone"
                                name="phone"
                                label={dict.phone}
                                value={values.phone}
                                readOnly
                                disabled
                                className={s.readOnlyField}
                            />
                            <InputField
                                id="email"
                                name="email"
                                label={dict.email}
                                value={values.email}
                                onChange={handleChange}
                                error={errors.email}
                                touched={touched.email}
                            />
                            <InputField
                                id="birthday"
                                name="birthday"
                                label={dict.birthday}
                                type="date"
                                value={values.birthday}
                                onChange={handleChange}
                            />
                        </div>

                        <div className={s.genderSection}>
                            <span className={s.genderTitle}>{dict.gender.title}</span>
                            <div className={s.genderOptions}>
                                <button
                                    type="button"
                                    className={clsx(s.genderBtn, values.gender === 'male' && s.active)}
                                    onClick={() => setFieldValue('gender', 'male')}
                                >
                                    <div className={s.radioCircle}>
                                        {values.gender === 'male' && <div className={s.innerCircle} />}
                                    </div>
                                    <span>{dict.gender.male}</span>
                                </button>
                                <button
                                    type="button"
                                    className={clsx(s.genderBtn, values.gender === 'female' && s.active)}
                                    onClick={() => setFieldValue('gender', 'female')}
                                >
                                    <div className={s.radioCircle}>
                                        {values.gender === 'female' && <div className={s.innerCircle} />}
                                    </div>
                                    <span>{dict.gender.female}</span>
                                </button>
                            </div>
                        </div>

                        <div className={s.socialConnect}>
                            <button type="button" className={s.googleBtn}>
                                <div className={s.googleIcon} />
                                <span>{dict.googleAuth}</span>
                            </button>
                        </div>

                        <div className={s.actions}>
                            <Button type="submit" variant="black" className={s.submitBtn}>
                                {dict.saveButton}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
}
