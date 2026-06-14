'use client';

import React, { useEffect } from 'react';
import Modal from 'react-modal';
import useScrollLock from '@/hooks/useScrollLock';
import Button from '@/app/components/ui/Button/Button';
import s from './ShoppingListNotificationModal.module.scss';

interface ShoppingListNotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    lang: 'ua' | 'ru';
    buttonText?: string;
}

export default function ShoppingListNotificationModal({
    isOpen,
    onClose,
    title,
    message,
    lang,
    buttonText
}: ShoppingListNotificationModalProps) {
    const { disableScroll, enableScroll } = useScrollLock();

    useEffect(() => {
        if (isOpen) {
            disableScroll();
            return () => enableScroll();
        }
    }, [isOpen, disableScroll, enableScroll]);

    const defaultButtonText = 'OK';
    const btnText = buttonText || defaultButtonText;

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
                <button 
                    className={s.closeBtn} 
                    onClick={onClose} 
                    aria-label={lang === 'ua' ? 'Закрити' : 'Закрыть'}
                >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M1 1L17 17M17 1L1 17" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>

                <div className={s.content}>
                    <h2 className={s.title}>{title}</h2>
                    <p className={s.message}>{message}</p>
                    <div className={s.actions}>
                        <Button 
                            variant="black" 
                            onClick={onClose} 
                            className={s.btn}
                        >
                            {btnText}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
