'use client';

import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useParams } from 'next/navigation';
import { usePhoneMask } from '@/hooks/usePhoneMask';
import Button from '@/app/components/ui/Button/Button';
import InputField from '@/app/components/ui/InputField';
import TextareaField from '@/app/components/ui/TextareaField';
import { ApplicantFormPageDict } from '@/i18n/types';
import s from './ApplicantForm.module.scss';
import CustomSelect from '@/app/components/ui/CustomSelect';
import clsx from "clsx";

import Modal from 'react-modal';
import useScrollLock from '@/hooks/useScrollLock';

import DatePicker from '@/app/components/ui/DatePicker/DatePicker';
import { format } from 'date-fns';
import { parseDate } from '@/lib/utils/date';
import { PHONE_REGEX, formatPhone } from '@/lib/utils/phone';
import { 
    getCareerPositionsApi, 
    submitCareerApplicationApi, 
    getLocalitiesApi,
    CareerPosition,
    Locality 
} from '@/lib/graphql';

interface ApplicantFormProps {
    dict: ApplicantFormPageDict['form'];
}

export default function ApplicantForm({ dict }: ApplicantFormProps) {
    const params = useParams();
    const lang = (params?.lang as string) || 'ua';

    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [submitSuccessMessage, setSubmitSuccessMessage] = useState<string>('');
    const [submitError, setSubmitError] = useState<string>('');
    const { disableScroll, enableScroll } = useScrollLock();
    
    const [positions, setPositions] = useState<CareerPosition[]>([]);
    const [localities, setLocalities] = useState<Locality[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        if (isSuccessModalOpen) {
            disableScroll();
        } else {
            enableScroll();
        }
        return () => enableScroll();
    }, [isSuccessModalOpen, disableScroll, enableScroll]);

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoadingData(true);
            try {
                const localitiesRes = await getLocalitiesApi(undefined, 50, 1, lang, true);
                if (localitiesRes && localitiesRes.data) {
                    setLocalities(localitiesRes.data);
                }
            } catch (error) {
                console.error('Failed to load localities:', error);
            } finally {
                setIsLoadingData(false);
            }
        };
        loadInitialData();
    }, [lang]);

    const positionOptions = React.useMemo(() => {
        if (positions.length > 0) {
            const unique = positions.filter((p, index, self) =>
                index === self.findIndex(t => t.name === p.name)
            );
            return unique.map(p => ({ label: p.name, value: p.id }));
        }
        return [
            { label: dict.options.manager || 'Менеджер', value: 'manager' },
            { label: dict.options.cook || 'Шеф кухар', value: 'cook' },
            { label: dict.options.cashier || 'Касир', value: 'cashier' },
        ];
    }, [positions, dict]);

    const locationOptions = React.useMemo(() => {
        if (localities.length > 0) {
            return localities.map(loc => ({ label: loc.name, value: String(loc.id) }));
        }
        return [
            { label: dict.options.kyiv || 'м. Київ', value: '2581' },
        ];
    }, [localities, dict]);

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
            setSubmitError('');
            try {
                const parsedPositionId = parseInt(values.desiredPosition, 10);
                const isNumericPosId = !isNaN(parsedPositionId);
                const matchedPosition = positions.find(p => p.id === values.desiredPosition);

                const parsedLocalityId = parseInt(values.location, 10);
                const isNumericLocId = !isNaN(parsedLocalityId);

                const result = await submitCareerApplicationApi({
                    fullName: values.fullName,
                    dob: values.dob,
                    phone: formatPhone(values.phone),
                    desiredPosition: matchedPosition ? matchedPosition.name : values.desiredPosition,
                    careerPositionId: isNumericPosId ? parsedPositionId : undefined,
                    localityId: isNumericLocId ? parsedLocalityId : undefined,
                    hasExperience: values.hasExperience === 'yes',
                    experience: values.hasExperience === 'yes',
                    additionalInfo: values.additionalInfo || undefined,
                    consent: values.consent,
                }, lang);

                if (result.success) {
                    resetForm();
                    setSubmitSuccessMessage(result.message || '');
                    setIsSuccessModalOpen(true);
                } else {
                    setSubmitError(result.message || 'Не вдалося відправити заявку. Спробуйте ще раз.');
                }
            } catch (error: any) {
                console.error('Error submitting career application:', error);
                let errMsg = 'Сталася помилка при відправці заявки. Будь ласка, спробуйте пізніше.';
                if (error?.errors && Array.isArray(error.errors) && error.errors.length > 0) {
                    const firstErr = error.errors[0];
                    const valErrors = firstErr?.extensions?.validation;
                    if (valErrors && typeof valErrors === 'object') {
                        const firstKey = Object.keys(valErrors)[0];
                        if (firstKey && valErrors[firstKey]?.[0]) {
                            errMsg = `${valErrors[firstKey][0]}`;
                        }
                    } else if (firstErr?.message) {
                        errMsg = firstErr.message;
                    }
                } else if (error?.message) {
                    errMsg = error.message;
                }
                setSubmitError(errMsg);
            } finally {
                setSubmitting(false);
            }
        },
    });

    const currentLocation = formik.values.location;

    useEffect(() => {
        const fetchPositions = async () => {
            const locId = currentLocation ? parseInt(currentLocation, 10) : undefined;
            try {
                const fetchedPositions = await getCareerPositionsApi(
                    locId && !isNaN(locId) ? locId : undefined,
                    lang
                );
                setPositions(fetchedPositions);
            } catch (error) {
                console.error('Failed to load career positions:', error);
            }
        };
        fetchPositions();
    }, [currentLocation, lang]);

    const handlePhoneRawChange = (raw: string) => {
        formik.setFieldValue('phone', raw);
    };

    const { formatted: phoneFormatted, handleChange: handlePhoneChange, handleFocus: handlePhoneFocus } = usePhoneMask(
        formik.values.phone,
        handlePhoneRawChange,
    );

    return (
        <form className={s.form} onSubmit={formik.handleSubmit} noValidate>
            {submitError && (
                <div style={{ color: 'var(--color-error, #e53935)', marginBottom: '16px', fontWeight: 500 }}>
                    {submitError}
                </div>
            )}
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
                <DatePicker
                    id="dob"
                    label={dict.dob}
                    required
                    selected={formik.values.dob ? parseDate(formik.values.dob) : null}
                    onChange={(date) => formik.setFieldValue('dob', date ? format(date, 'dd.MM.yyyy') : '')}
                    onBlur={() => formik.setFieldTouched('dob', true)}
                    error={formik.errors.dob}
                    touched={formik.touched.dob}
                    maxDate={new Date()}
                    minDate={new Date('1940-01-01')}
                    lang={lang as 'ua' | 'ru'}
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
                    onFocus={(e) => {
                        e.currentTarget.removeAttribute('readonly');
                        formik.setFieldTouched('phone', false);
                        handlePhoneFocus();
                    }}
                    error={formik.errors.phone}
                    touched={formik.touched.phone}
                />

                {/* Desired Position */}
                <div className={s.groupField}>
                    <h3 className={s.groupTitle}>{dict.desiredPosition}</h3>
                    <CustomSelect
                        value={formik.values.desiredPosition}
                        options={positionOptions}
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
                    <h3 className={s.groupTitle}>{dict.hasExperience}</h3>
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
                    <h3 className={s.groupTitle}>{dict.location}</h3>
                    <CustomSelect
                        value={formik.values.location}
                        options={locationOptions}
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
                    disabled={formik.isSubmitting || isLoadingData}
                >
                    {dict.submitText}
                </Button>
            </div>

            <Modal
                isOpen={isSuccessModalOpen}
                onRequestClose={() => setIsSuccessModalOpen(false)}
                className={s.modalWrapper}
                overlayClassName={s.modalOverlay}
                ariaHideApp={false}
                closeTimeoutMS={200}
            >
                <div className={s.modalCard}>
                    <button
                        type="button"
                        className={s.modalCloseBtn}
                        onClick={() => setIsSuccessModalOpen(false)}
                        aria-label="Close modal"
                    >
                        ✕
                    </button>
                    <div className={s.modalIcon}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h3 className={s.modalTitle}>Дякуємо за вашу заявку!</h3>
                    <p className={s.modalMessage}>
                        {submitSuccessMessage || (lang === 'ru' ? 'Мы свяжемся с вами в ближайшее время.' : 'Ми зв’яжемося з вами найближчим часом.')}
                    </p>
                    <Button
                        type="button"
                        variant="red"
                        className={s.modalButton}
                        onClick={() => setIsSuccessModalOpen(false)}
                    >
                        ОК
                    </Button>
                </div>
            </Modal>
        </form>
    );
}

