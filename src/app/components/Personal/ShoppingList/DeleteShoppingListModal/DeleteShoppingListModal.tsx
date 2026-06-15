'use client';

import React, { useEffect } from 'react';
import Modal from 'react-modal';
import useScrollLock from '@/hooks/useScrollLock';
import Button from '@/app/components/ui/Button/Button';
import s from './DeleteShoppingListModal.module.scss';

interface DeleteShoppingListModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    lang: 'ua' | 'ru';
}

const dict = {
    ua: {
        title: "Видалення списку покупок",
        message: "Ви впевнені, що хочете видалити цей список покупок?",
        confirm: "Видалити",
        cancel: "Скасувати"
    },
    ru: {
        title: "Удаление списка покупок",
        message: "Вы уверены, что хотите удалить этот список покупок?",
        confirm: "Удалить",
        cancel: "Отменить"
    }
};

export default function DeleteShoppingListModal({ isOpen, onClose, onConfirm, lang }: DeleteShoppingListModalProps) {
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
                    aria-label="Закрити"
                >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M1 1L17 17M17 1L1 17" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>

                <div className={s.content}>
                    <h2 className={s.title}>{t.title}</h2>
                    <p className={s.message}>{t.message}</p>
                    <div className={s.actions}>
                        <Button 
                            variant="outline-black" 
                            onClick={onClose} 
                            className={s.btn}
                        >
                            {t.cancel}
                        </Button>
                        <Button 
                            variant="red" 
                            onClick={onConfirm} 
                            className={s.btn}
                        >
                            {t.confirm}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
