'use client';

import { useEffect, useState, useRef } from 'react';
import Modal from 'react-modal';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import clsx from 'clsx';
import useScrollLock from '@/hooks/useScrollLock';
import s from './VideoReviewModal.module.scss';
import Button from "@/app/components/ui/Button/Button";
import InputField from '@/app/components/ui/InputField';
import TextareaField from '@/app/components/ui/TextareaField';

interface VideoReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SUPPORTED_FORMATS = ["video/mp4", "video/quicktime", "video/webm"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const videoReviewSchema = Yup.object().shape({
    name: Yup.string().trim().required("Ім'я є обов'язковим"),
    comment: Yup.string().trim().required("Коментар є обов'язковим"),
    video: Yup.mixed()
        .required("Відео файл є обов'язковим")
        .test("fileSize", "Розмір файлу не повинен перевищувати 5МБ", (value) => {
            if (!value) return true;
            return (value as File).size <= MAX_FILE_SIZE;
        })
        .test("fileType", "Підтримуються лише відео формати (MP4, MOV, WEBM)", (value) => {
            if (!value) return true;
            return SUPPORTED_FORMATS.includes((value as File).type);
        }),
});

export default function VideoReviewModal({ isOpen, onClose }: VideoReviewModalProps) {
    const { disableScroll, enableScroll } = useScrollLock();
    const [submitted, setSubmitted] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            comment: '',
            video: null as File | null,
        },
        validationSchema: videoReviewSchema,
        onSubmit: async (values, { setStatus }) => {
            try {
                // TODO: Replace with actual API call (e.g. FormData upload)
                await new Promise((resolve) => setTimeout(resolve, 1000));
                console.log('Video Review submitted:', values);
                setSubmitted(true);
            } catch {
                setStatus('Не вдалося надіслати відео-відгук. Спробуйте ще раз.');
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

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.currentTarget.files?.[0] || null;
        formik.setFieldValue("video", file);
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
            <button className={s.closeBtn} onClick={handleClose} aria-label="Закрити">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M11.7625 9.99893L19.6326 2.14129C19.8678 1.90606 20 1.58701 20 1.25434C20 0.921668 19.8678 0.602622 19.6326 0.367388C19.3974 0.132153 19.0783 0 18.7457 0C18.413 0 18.0939 0.132153 17.8587 0.367388L10.0011 8.23752L2.14342 0.367388C1.90819 0.132153 1.58914 2.95361e-07 1.25647 2.97839e-07C0.9238 3.00318e-07 0.604754 0.132153 0.369519 0.367388C0.134285 0.602622 0.00213223 0.921668 0.00213223 1.25434C0.00213223 1.58701 0.134285 1.90606 0.369519 2.14129L8.23966 9.99893L0.369519 17.8566C0.252431 17.9727 0.159496 18.1109 0.0960746 18.2631C0.0326529 18.4153 0 18.5786 0 18.7435C0 18.9084 0.0326529 19.0717 0.0960746 19.224C0.159496 19.3762 0.252431 19.5143 0.369519 19.6305C0.485651 19.7476 0.623817 19.8405 0.776047 19.9039C0.928277 19.9673 1.09156 20 1.25647 20C1.42138 20 1.58467 19.9673 1.7369 19.9039C1.88913 19.8405 2.02729 19.7476 2.14342 19.6305L10.0011 11.7603L17.8587 19.6305C17.9748 19.7476 18.113 19.8405 18.2652 19.9039C18.4175 19.9673 18.5807 20 18.7457 20C18.9106 20 19.0739 19.9673 19.2261 19.9039C19.3783 19.8405 19.5165 19.7476 19.6326 19.6305C19.7497 19.5143 19.8426 19.3762 19.9061 19.224C19.9695 19.0717 20.0021 18.9084 20.0021 18.7435C20.0021 18.5786 19.9695 18.4153 19.9061 18.2631C19.8426 18.1109 19.7497 17.9727 19.6326 17.8566L11.7625 9.99893Z" fill="white" />
                </svg>
            </button>

            <div className={s.modal}>
                {submitted ? (
                    <div className={s.successView}>
                        <div className={s.successIcon}>
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="24" cy="24" r="24" fill="#e3051b" fillOpacity="0.08" />
                                <path d="M14 24.5L21 31.5L34 17" stroke="#e3051b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h2 className={s.successTitle}>Дякуємо за відео-відгук!</h2>
                        <p className={s.successText}>Ваш відео-відгук успішно надіслано. Ми нарахуємо вам 100 балів після модерації.</p>
                        <Button type="button" className={s.submitBtn} onClick={handleClose} variant='red'>Закрити</Button>
                    </div>
                ) : (
                    <>
                        <h2 className={s.title}>Залиште відео-відгук</h2>
                        <p className={s.subtitle}>Отримуйте 100 балів на бонусний рахунок за кожне відео</p>

                        <form className={s.form} onSubmit={formik.handleSubmit} noValidate>
                            <InputField
                                id="video-name"
                                type="text"
                                name="name"
                                label="Ваше ім'я"
                                required
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.errors.name}
                                touched={formik.touched.name}
                            />

                            <div className={clsx(s.fileUpload, formik.errors.video && formik.touched.video && s.fileUploadError)}>
                                <label className={s.fileLabel}>Завантажте відео</label>
                                <div 
                                    className={s.dropzone}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className={s.hiddenInput}
                                        accept="video/mp4,video/quicktime,video/webm"
                                        onChange={handleFileChange}
                                    />
                                    <div className={s.dropzoneContent}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 16V8M12 8L9 11M12 8L15 11M4 16C4 17.1046 4.89543 18 6 18H18C19.1046 18 20 17.1046 20 16" stroke="#A0A0A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        <span>{formik.values.video ? (formik.values.video as File).name : "Натисніть або перетягніть файл"}</span>
                                        <p className={s.fileHint}>MP4, MOV або WEBM до 5МБ</p>
                                    </div>
                                </div>
                                {formik.errors.video && formik.touched.video && (
                                    <div className={s.errorText}>{formik.errors.video as string}</div>
                                )}
                            </div>

                            <TextareaField
                                id="video-comment"
                                name="comment"
                                label="Ваш коментар"
                                required
                                value={formik.values.comment}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.errors.comment}
                                touched={formik.touched.comment}
                                rows={3}
                            />

                            {formik.status && <div className={s.errorBox}>{formik.status}</div>}

                            <Button type="submit" className={s.submitBtn} disabled={formik.isSubmitting} variant='red'>
                                {formik.isSubmitting ? 'Надсилаємо...' : 'Відправити відгук'}
                            </Button>
                        </form>
                    </>
                )}
            </div>
        </Modal>
    );
}
