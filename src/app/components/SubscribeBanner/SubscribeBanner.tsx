'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import s from './SubscribeBanner.module.scss';
import clsx from 'clsx';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Button from '../ui/Button/Button';

interface SubscribeBannerProps {
    image: string;
    title: string;
    lang?: string;
}

export default function SubscribeBanner({ image, title, lang = 'ua' }: SubscribeBannerProps) {
    const [success, setSuccess] = useState(false);

    const formik = useFormik({
        initialValues: {
            email: '',
        },
        validateOnChange: false,
        validateOnBlur: false,
        validationSchema: Yup.object({
            email: Yup.string()
                .required(lang === 'ru' ? 'Введите email' : 'Введіть email')
                .email(lang === 'ru' ? 'Неверный формат email' : 'Невірний формат email'),
        }),
        onSubmit: (values, { resetForm }) => {
            // Simulate API call
            setSuccess(true);
            resetForm();
            setTimeout(() => setSuccess(false), 3000); // optional: hide success msg after 3s
        },
    });

    const hasError = formik.touched.email && !!formik.errors.email;

    return (
        <div className={s.subscribeBanner}>
            <div className={s.subscribeBg1}>
                <Image src={image} alt={title} fill style={{ objectFit: 'cover' }} />
            </div>
            <div className={s.subscribeContent}>
                <div className={s.subscribeTextCol}>
                    <svg className={s.subscribeArrows} width="24" height="20" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.8063 19.0314C12.5105 19.0314 11.3363 18.0191 11.3363 16.6424C11.3363 16.035 11.5792 15.3871 12.0246 14.9012L17.2076 9.51581L12.0246 4.1304C11.5792 3.6445 11.3363 3.03712 11.3363 2.38925C11.3363 1.05302 12.4701 0.000233732 13.7658 0.000233732C14.4137 0.000233732 15.0615 0.243184 15.5474 0.729085L22.3501 7.81515C22.7955 8.26056 23.0789 8.86794 23.0789 9.51581C23.0789 10.1232 22.7955 10.7711 22.3501 11.2165L15.5474 18.3025C15.0615 18.7884 14.4137 19.0314 13.8063 19.0314ZM2.42809 19.0314C1.13235 19.0314 -0.00142139 18.0191 -0.00142139 16.6424C-0.00142139 16.035 0.201038 15.3871 0.646447 14.9012L5.86989 9.51581L0.646447 4.1304C0.201038 3.6445 -0.00142139 3.03712 -0.00142139 2.38925C-0.00142139 1.05302 1.09186 0.000233732 2.3876 0.000233732C3.03546 0.000233732 3.68333 0.243184 4.16923 0.729085L10.9719 7.81515C11.4173 8.26056 11.7412 8.86794 11.7412 9.51581C11.7412 10.1232 11.4173 10.7711 10.9719 11.2165L4.16923 18.3025C3.68333 18.7884 3.07596 19.0314 2.42809 19.0314Z" fill="#E6000F"/>
                    </svg>
                    <h2 className={s.subscribeTitle}>
                        {title}
                    </h2>
                    <svg className={clsx(s.subscribeArrows, s.bigArrows)} width="24" height="20" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.8063 19.0314C12.5105 19.0314 11.3363 18.0191 11.3363 16.6424C11.3363 16.035 11.5792 15.3871 12.0246 14.9012L17.2076 9.51581L12.0246 4.1304C11.5792 3.6445 11.3363 3.03712 11.3363 2.38925C11.3363 1.05302 12.4701 0.000233732 13.7658 0.000233732C14.4137 0.000233732 15.0615 0.243184 15.5474 0.729085L22.3501 7.81515C22.7955 8.26056 23.0789 8.86794 23.0789 9.51581C23.0789 10.1232 22.7955 10.7711 22.3501 11.2165L15.5474 18.3025C15.0615 18.7884 14.4137 19.0314 13.8063 19.0314ZM2.42809 19.0314C1.13235 19.0314 -0.00142139 18.0191 -0.00142139 16.6424C-0.00142139 16.035 0.201038 15.3871 0.646447 14.9012L5.86989 9.51581L0.646447 4.1304C0.201038 3.6445 -0.00142139 3.03712 -0.00142139 2.38925C-0.00142139 1.05302 1.09186 0.000233732 2.3876 0.000233732C3.03546 0.000233732 3.68333 0.243184 4.16923 0.729085L10.9719 7.81515C11.4173 8.26056 11.7412 8.86794 11.7412 9.51581C11.7412 10.1232 11.4173 10.7711 10.9719 11.2165L4.16923 18.3025C3.68333 18.7884 3.07596 19.0314 2.42809 19.0314Z" fill="#E6000F"/>
                    </svg>
                </div>
                <div className={s.subscribeFormCol}>
                    <form className={s.form} onSubmit={formik.handleSubmit} noValidate>
                        <div className={clsx(s.inputWrapper, hasError && s.hasError)}>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="E-mail"
                                className={clsx(s.subscribeInput, hasError && s.hasError)}
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                onFocus={() => {
                                    if (formik.errors.email || formik.touched.email) {
                                        formik.setFieldError('email', undefined);
                                        formik.setFieldTouched('email', false, false);
                                    }
                                }}
                            />
                            <Button type="submit" variant="red" className={s.subscribeSubmitBtn}>
                                {lang === 'ru' ? 'Подписаться' : 'Підписатись'}
                            </Button>
                        </div>
                        {hasError && <span className={s.errorText}>{formik.errors.email as string}</span>}
                        {success && <span className={s.successText}>{lang === 'ru' ? 'Вы успешно подписались!' : 'Ви успішно підписалися!'}</span>}
                    </form>
                </div>
            </div>
        </div>
    );
}
