'use client';

import React, { useEffect } from 'react';
import Modal from 'react-modal';
import useScrollLock from '@/hooks/useScrollLock';
import Button from '@/app/components/ui/Button/Button';
import s from './ErrorModal.module.scss';

interface ErrorModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message: string;
    buttonText?: string;
    lang?: 'ua' | 'ru';
}

export default function ErrorModal({
    isOpen,
    onClose,
    title,
    message,
    buttonText,
    lang = 'ua',
}: ErrorModalProps) {
    const { disableScroll, enableScroll } = useScrollLock();

    useEffect(() => {
        if (isOpen) {
            disableScroll();
            return () => enableScroll();
        }
    }, [isOpen, disableScroll, enableScroll]);

    const defaultTitle = lang === 'ua' ? 'Помилка' : 'Ошибка';
    const defaultBtnText = lang === 'ua' ? 'ЗРОЗУМІЛО' : 'ПОНЯТНО';

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className={{
                base: s.modalWrapper,
                afterOpen: s.modalWrapperOpen,
                beforeClose: s.modalWrapperBeforeClose
            }}
            overlayClassName={{
                base: s.overlay,
                afterOpen: s.overlayAfterOpen,
                beforeClose: s.overlayBeforeClose
            }}
            ariaHideApp={false}
            closeTimeoutMS={200}
        >
            <div className={s.modal}>
                <button className={s.closeBtn} onClick={onClose} aria-label={lang === 'ua' ? 'Закрити' : 'Закрыть'}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>

                <div className={s.iconWrapper}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                </div>

                <h3 className={s.title}>{title || defaultTitle}</h3>
                <p className={s.message}>{message}</p>

                <Button 
                    variant="red" 
                    className={s.confirmBtn}
                    onClick={onClose}
                >
                    {buttonText || defaultBtnText}
                </Button>
            </div>
        </Modal>
    );
}
