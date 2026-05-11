'use client';

import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import s from './AddCardModal.module.scss';
import useScrollLock from '@/hooks/useScrollLock';
import Button from '@/app/components/ui/Button/Button';
import InputField from '@/app/components/ui/InputField';

interface AddCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    lang: 'ua' | 'ru';
}

const dict = {
    ua: {
        title: "ДОДАТИ БАНКІВСЬКУ КАРТКУ",
        cardNumber: "Номер банківської картки",
        expiry: "Період дії картки",
        cvv: "CVV код",
        submit: "Підтвердити"
    },
    ru: {
        title: "ДОБАВИТЬ БАНКОВСКУЮ КАРТУ",
        cardNumber: "Номер банковской карты",
        expiry: "Период действия карты",
        cvv: "CVV код",
        submit: "Подтвердить"
    }
};

export default function AddCardModal({ isOpen, onClose, lang }: AddCardModalProps) {
    const { disableScroll, enableScroll } = useScrollLock();
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');

    useEffect(() => {
        if (isOpen) {
            disableScroll();
            return () => enableScroll();
        }
    }, [isOpen, disableScroll, enableScroll]);

    const t = dict[lang];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // UI only demonstration
        onClose();
    };

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
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M1 1L17 17M17 1L1 17" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>

                <div className={s.content}>
                    <h2 className={s.title}>{t.title}</h2>
                    
                    <form className={s.form} onSubmit={handleSubmit}>
                        <InputField 
                            id="cardNumber"
                            label={t.cardNumber}
                            required
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="0000 0000 0000 0000"
                        />
                        <InputField 
                            id="expiry"
                            label={t.expiry}
                            required
                            value={expiry}
                            onChange={(e) => setExpiry(e.target.value)}
                            placeholder="03/26"
                        />
                        <InputField 
                            id="cvv"
                            label={t.cvv}
                            required
                            type="password"
                            maxLength={3}
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value)}
                            placeholder="***"
                        />
                        <Button type="submit" variant="black" className={s.submitBtn}>
                            {t.submit}
                        </Button>
                    </form>
                </div>
            </div>
        </Modal>
    );
}
