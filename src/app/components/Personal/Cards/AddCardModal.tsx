'use client';

import React, { useEffect } from 'react';
import Modal from 'react-modal';
import s from './AddCardModal.module.scss';
import useScrollLock from '@/hooks/useScrollLock';
import Button from '@/app/components/ui/Button/Button';

interface AddCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    lang: 'ua' | 'ru';
}

const dict = {
    ua: {
        title: "Додати банківську картку",
        description: "Цей розділ наразі знаходиться в стадії розробки. Ви зможете додати карту під час оплати замовлення.",
        close: "ЗАКРИТИ"
    },
    ru: {
        title: "Добавить банковскую карту",
        description: "Этот раздел сейчас находится в стадии разработки. Вы сможете добавить карту при оплате заказа.",
        close: "ЗАКРЫТЬ"
    }
};

export default function AddCardModal({ isOpen, onClose, lang }: AddCardModalProps) {
    const { disableScroll, enableScroll } = useScrollLock();

    useEffect(() => {
        if (isOpen) {
            disableScroll();
            return () => enableScroll();
        }
    }, [isOpen, disableScroll, enableScroll]);

    const t = dict[lang];

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className={s.modalWrapper}
            overlayClassName={s.overlay}
            ariaHideApp={false}
            closeTimeoutMS={200}
        >
            <div className={s.modal}>
                <button className={s.closeBtn} onClick={onClose} aria-label="Закрити">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>

                <div className={s.content}>
                    <h2 className={s.title}>{t.title}</h2>
                    <p className={s.description}>{t.description}</p>
                    <Button variant="red" onClick={onClose} className={s.closeActionBtn}>
                        {t.close}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
