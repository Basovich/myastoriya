'use client';

import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { usePhoneMask } from '@/hooks/usePhoneMask';
import Button from '@/app/components/ui/Button/Button';
import InputField from '@/app/components/ui/InputField';
import TextareaField from '@/app/components/ui/TextareaField';
import { ApplicantFormPageDict } from '@/i18n/types';
import s from './ApplicantForm.module.scss';
import CustomSelect from '@/app/components/ui/CustomSelect';
import clsx from "clsx";

interface ApplicantFormProps {
    dict: ApplicantFormPageDict['form'];
}

export default function ApplicantForm({ dict }: ApplicantFormProps) {
    const [isSubmitted, setIsSubmitted] = useState(false);

    const PHONE_REGEX = /^380\d{9}$/;

    const validationSchema = Yup.object({
        fullName: Yup.string().required(dict.errors.required),
        dob: Yup.string().required(dict.errors.required),
        phone: Yup.string()
            .required(dict.errors.required)
            .matches(PHONE_REGEX, dict.errors.invalidPhone),
        desiredPosition: Yup.string().required(dict.errors.required),
        hasExperience: Yup.string().required(dict.errors.required),
        location: Yup.string().required(dict.errors.required),
        additionalInfo: Yup.string(),
        consent: Yup.boolean().oneOf([true], dict.errors.required),
    });

    const formik = useFormik({
        initialValues: {
            fullName: '',
            dob: '',
            phone: '',
            desiredPosition: '',
            hasExperience: '',
            location: '',
            additionalInfo: '',
            consent: false,
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                setIsSubmitted(true);
                resetForm();
            } catch (error) {
                console.error(error);
            } finally {
                setSubmitting(false);
            }
        },
    });

    const handlePhoneRawChange = (raw: string) => {
        formik.setFieldValue('phone', raw);
    };

    const { formatted: phoneFormatted, handleChange: handlePhoneChange } = usePhoneMask(
        formik.values.phone,
        handlePhoneRawChange,
    );

    if (isSubmitted) {
        return (
            <div className={s.successMessage}>
                <h3>Дякуємо за вашу заявку!</h3>
                <p>Ми зв&apos;яжемося з вами найближчим часом.</p>
            </div>
        );
    }

    return (
        <form className={s.form} onSubmit={formik.handleSubmit} noValidate>
            <div className={s.grid}>
                {/* Full Name */}
                <InputField
                    id="fullName"
                    type="text"
                    name="fullName"
                    label={dict.fullName}
                    required
                    value={formik.values.fullName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    onFocus={() => formik.setFieldTouched('fullName', false)}
                    error={formik.errors.fullName}
                    touched={formik.touched.fullName}
                />

                {/* DOB */}
                <InputField
                    id="dob"
                    type="text"
                    name="dob"
                    label={dict.dob}
                    required
                    value={formik.values.dob}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    onFocus={() => formik.setFieldTouched('dob', false)}
                    error={formik.errors.dob}
                    touched={formik.touched.dob}
                />

                {/* Phone */}
                <InputField
                    id="phone"
                    type="tel"
                    name="phone"
                    label={dict.phone}
                    required
                    value={phoneFormatted}
                    onChange={handlePhoneChange}
                    onBlur={() => formik.setFieldTouched('phone', true)}
                    onFocus={() => formik.setFieldTouched('phone', false)}
                    error={formik.errors.phone}
                    touched={formik.touched.phone}
                />

                {/* Desired Position */}
                <div className={s.groupField}>
                    <h3 className={s.groupTitle}>{dict.desiredPosition}:</h3>
                    <CustomSelect
                        value={formik.values.desiredPosition}
                        options={[
                            { label: 'Менеджер', value: 'manager' },
                            { label: 'Кухар', value: 'cook' },
                            { label: 'Касир', value: 'cashier' },
                        ]}
                        onChange={(val) => formik.setFieldValue('desiredPosition', val)}
                        onBlur={() => formik.setFieldTouched('desiredPosition', true)}
                        placeholder={dict.options.chooseVariant}
                        error={Boolean(formik.touched.desiredPosition && formik.errors.desiredPosition)}
                    />
                    {formik.touched.desiredPosition && formik.errors.desiredPosition && (
                        <span className={clsx(s.fieldError, s.fieldErrorSelect)}>{formik.errors.desiredPosition}</span>
                    )}
                </div>

                {/* Has Experience */}
                <div className={s.groupField}>
                    <h3 className={s.groupTitle}>{dict.hasExperience}?</h3>
                    <div className={s.radioGroup}>
                        <label className={s.radioLabel}>
                            <input
                                type="radio"
                                name="hasExperience"
                                value="yes"
                                className={s.radioInput}
                                checked={formik.values.hasExperience === 'yes'}
                                onChange={formik.handleChange}
                            />
                            <span className={s.radioCustom}></span>
                            {dict.options.yes}
                        </label>
                        <label className={s.radioLabel}>
                            <input
                                type="radio"
                                name="hasExperience"
                                value="no"
                                className={s.radioInput}
                                checked={formik.values.hasExperience === 'no'}
                                onChange={formik.handleChange}
                            />
                            <span className={s.radioCustom}></span>
                            {dict.options.no}
                        </label>
                    </div>
                    {formik.touched.hasExperience && formik.errors.hasExperience && (
                        <span className={s.fieldError}>{formik.errors.hasExperience}</span>
                    )}
                </div>

                {/* Location */}
                <div className={s.groupField}>
                    <h3 className={s.groupTitle}>{dict.location}:</h3>
                    <CustomSelect
                        value={formik.values.location}
                        options={[
                            { label: dict.options.kyiv, value: 'kyiv' },
                        ]}
                        onChange={(val) => formik.setFieldValue('location', val)}
                        onBlur={() => formik.setFieldTouched('location', true)}
                        placeholder={dict.options.chooseVariant}
                        error={Boolean(formik.touched.location && formik.errors.location)}
                    />
                    {formik.touched.location && formik.errors.location && (
                        <span className={clsx(s.fieldError, s.fieldErrorSelect)}>{formik.errors.location}</span>
                    )}
                </div>

                {/* Additional Info */}
                <TextareaField
                    id="additionalInfo"
                    name="additionalInfo"
                    label={dict.additionalInfo}
                    value={formik.values.additionalInfo}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    onFocus={() => formik.setFieldTouched('additionalInfo', false)}
                    error={formik.errors.additionalInfo}
                    touched={formik.touched.additionalInfo}
                />

                <div className={s.requiredNote}>
                    <span className={s.redAsterisk}>*</span> — поля, що є обов&apos;язковими до заповнення
                </div>

                {/* Consent */}
                <div className={s.fullWidth}>
                    <label className={s.checkboxLabel}>
                        <input
                            type="checkbox"
                            name="consent"
                            className={s.checkbox}
                            checked={formik.values.consent}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        <span className={s.checkmark}></span>
                        <span className={s.consentText}>{dict.consent}</span>
                    </label>
                    {formik.touched.consent && formik.errors.consent && (
                        <span className={s.fieldError}>{formik.errors.consent}</span>
                    )}
                </div>

                <Button
                    type="submit"
                    variant="red"
                    className={s.submitBtn}
                    disabled={formik.isSubmitting}
                >
                    {dict.submitText}
                </Button>
            </div>
        </form>
    );
}
