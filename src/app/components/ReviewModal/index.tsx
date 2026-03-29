'use client';

import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import clsx from 'clsx';
import useScrollLock from '@/hooks/useScrollLock';
import s from './ReviewModal.module.scss';
import Button from "@/app/components/ui/Button/Button";
import InputField from '@/app/components/ui/InputField';
import TextareaField from '@/app/components/ui/TextareaField';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const RATING_CATEGORIES = [
    { id: 'dishQuality', label: 'Якість страви чи товару' },
    { id: 'serviceQuality', label: 'Якість сервісу' },
    { id: 'deliverySpeed', label: 'Швидкість доставки' },
    { id: 'interactionEase', label: 'Зручність взаємодії' },
] as const;

type RatingCategoryId = (typeof RATING_CATEGORIES)[number]['id'];

type RatingsType = Record<RatingCategoryId, number>;

const reviewSchema = Yup.object({
    name: Yup.string().trim().required("Ім'я є обов'язковим"),
    review: Yup.string().trim().required("Відгук є обов'язковим"),
    ratings: Yup.object(
        Object.fromEntries(
            RATING_CATEGORIES.map(({ id }) => [id, Yup.number().min(1).max(5)])
        )
    ),
});

const defaultRatings: RatingsType = {
    dishQuality: 3,
    serviceQuality: 3,
    deliverySpeed: 3,
    interactionEase: 3,
};

export default function ReviewModal({ isOpen, onClose }: ReviewModalProps) {
    const { disableScroll, enableScroll } = useScrollLock();
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            disableScroll();
        } else {
            enableScroll();
        }
        return () => enableScroll();
    }, [isOpen, disableScroll, enableScroll]);

    const formik = useFormik({
        initialValues: {
            name: '',
            review: '',
            ratings: { ...defaultRatings } as RatingsType,
        },
        validationSchema: reviewSchema,
        onSubmit: async (values, { setStatus }) => {
            try {
                // TODO: Replace with actual API call
                await new Promise((resolve) => setTimeout(resolve, 600));
                console.log('Review submitted:', values);
                setSubmitted(true);
            } catch {
                setStatus('Не вдалося надіслати відгук. Спробуйте ще раз.');
            }
        },
    });

    const handleClose = () => {
        onClose();
        setTimeout(() => {
            formik.resetForm();
            setSubmitted(false);
        }, 300);
    };

    const setRating = (categoryId: RatingCategoryId, value: number) => {
        formik.setFieldValue(`ratings.${categoryId}`, value);
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={handleClose}
            className={s.modalWrapper}
            overlayClassName={s.overlay}
            ariaHideApp={false}
            closeTimeoutMS={200}
        >
            {/* Close button outside the card */}
            <button className={s.closeBtn} onClick={handleClose} aria-label="Закрити">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M11.7625 9.99893L19.6326 2.14129C19.8678 1.90606 20 1.58701 20 1.25434C20 0.921668 19.8678 0.602622 19.6326 0.367388C19.3974 0.132153 19.0783 0 18.7457 0C18.413 0 18.0939 0.132153 17.8587 0.367388L10.0011 8.23752L2.14342 0.367388C1.90819 0.132153 1.58914 2.95361e-07 1.25647 2.97839e-07C0.9238 3.00318e-07 0.604754 0.132153 0.369519 0.367388C0.134285 0.602622 0.00213223 0.921668 0.00213223 1.25434C0.00213223 1.58701 0.134285 1.90606 0.369519 2.14129L8.23966 9.99893L0.369519 17.8566C0.252431 17.9727 0.159496 18.1109 0.0960746 18.2631C0.0326529 18.4153 0 18.5786 0 18.7435C0 18.9084 0.0326529 19.0717 0.0960746 19.224C0.159496 19.3762 0.252431 19.5143 0.369519 19.6305C0.485651 19.7476 0.623817 19.8405 0.776047 19.9039C0.928277 19.9673 1.09156 20 1.25647 20C1.42138 20 1.58467 19.9673 1.7369 19.9039C1.88913 19.8405 2.02729 19.7476 2.14342 19.6305L10.0011 11.7603L17.8587 19.6305C17.9748 19.7476 18.113 19.8405 18.2652 19.9039C18.4175 19.9673 18.5807 20 18.7457 20C18.9106 20 19.0739 19.9673 19.2261 19.9039C19.3783 19.8405 19.5165 19.7476 19.6326 19.6305C19.7497 19.5143 19.8426 19.3762 19.9061 19.224C19.9695 19.0717 20.0021 18.9084 20.0021 18.7435C20.0021 18.5786 19.9695 18.4153 19.9061 18.2631C19.8426 18.1109 19.7497 17.9727 19.6326 17.8566L11.7625 9.99893Z" fill="white" />
                </svg>
            </button>

            {/* Modal card */}
            <div className={s.modal}>
                {submitted ? (
                    <div className={s.successView}>
                        <div className={s.successIcon}>
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="24" cy="24" r="24" fill="#e3051b" fillOpacity="0.08" />
                                <path d="M14 24.5L21 31.5L34 17" stroke="#e3051b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h2 className={s.successTitle}>Дякуємо за відгук!</h2>
                        <p className={s.successText}>Ваш відгук успішно надіслано. Ми цінуємо вашу думку.</p>
                        <Button type="button"
                                className={s.submitBtn}
                                onClick={handleClose}
                                variant='red'
                        >
                            Закрити
                        </Button>
                    </div>
                ) : (
                    <>
                        <h2 className={s.title}>Напишіть свій відгук та надайте оцінки</h2>

                        <form className={s.form} onSubmit={formik.handleSubmit} noValidate>
                            {/* Name field */}
                            <InputField
                                id="review-name"
                                type="text"
                                name="name"
                                label="Ім'я"
                                required
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                onFocus={() => formik.setFieldTouched('name', false)}
                                error={formik.errors.name}
                                touched={formik.touched.name}
                            />

                            {/* Rating categories */}
                            <div className={s.ratingsBlock}>
                                {RATING_CATEGORIES.map(({ id, label }) => {
                                    const currentRating = formik.values.ratings[id];
                                    return (
                                        <div key={id} className={s.ratingRow}>
                                            <span className={s.ratingLabel}>{label}</span>
                                            <div className={s.stars} role="group" aria-label={label}>
                                                {Array.from({ length: 5 }, (_, i) => {
                                                    const starValue = i + 1;
                                                    const isFilled = starValue <= currentRating;
                                                    return (
                                                        <button
                                                            key={i}
                                                            type="button"
                                                            aria-label={`${starValue} зірка`}
                                                            className={clsx(s.starBtn, isFilled && s.starBtnFilled)}
                                                            onClick={() => setRating(id, starValue)}
                                                        >
                                                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M16 2.66667L20.12 11.0267L29.3333 12.36L22.6667 18.8533L24.24 28.0267L16 23.6933L7.76 28.0267L9.33333 18.8533L2.66667 12.36L11.88 11.0267L16 2.66667Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Review textarea */}
                            <TextareaField
                                id="review-text"
                                name="review"
                                label="Напишіть своє враження про М'ясторію"
                                value={formik.values.review}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                onFocus={() => formik.setFieldTouched('review', false)}
                                error={formik.errors.review}
                                touched={formik.touched.review}
                                rows={4}
                            />

                            {formik.status && (
                                <div className={s.errorBox}>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8C1.5 11.59 4.41 14.5 8 14.5C11.59 14.5 14.5 11.59 14.5 8C14.5 4.41 11.59 1.5 8 1.5ZM8.75 11.25H7.25V7.25H8.75V11.25ZM8.75 6H7.25V4.5H8.75V6Z" fill="#e3051b" />
                                    </svg>
                                    {formik.status}
                                </div>
                            )}

                            <Button type="submit"
                                    className={s.submitBtn}
                                    disabled={formik.isSubmitting}
                                    variant='red'
                            >
                                {formik.isSubmitting ? 'Надсилаємо...' : 'Відправити'}
                            </Button>
                        </form>
                    </>
                )}
            </div>
        </Modal>
    );
}
