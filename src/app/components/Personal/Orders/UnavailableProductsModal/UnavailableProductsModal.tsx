'use client';

import React, { useEffect } from 'react';
import Modal from 'react-modal';
import useScrollLock from '@/hooks/useScrollLock';
import Button from '@/app/components/ui/Button/Button';
import s from './UnavailableProductsModal.module.scss';

export interface UnavailableProduct {
    id: string;
    name: string;
    quantity: number;
}

interface UnavailableProductsModalProps {
    isOpen: boolean;
    onClose: () => void;
    products: UnavailableProduct[];
    lang: 'ua' | 'ru';
}

const dict = {
    ua: {
        title: 'Деякі товари недоступні',
        subtitle: 'Наступні товари наразі не можна додати до кошика:',
        unit: 'шт.',
        closeBtn: 'ЗРОЗУМІЛО',
    },
    ru: {
        title: 'Некоторые товары недоступны',
        subtitle: 'Следующие товары сейчас нельзя добавить в корзину:',
        unit: 'шт.',
        closeBtn: 'ПОНЯТНО',
    },
};

export default function UnavailableProductsModal({
    isOpen,
    onClose,
    products,
    lang,
}: UnavailableProductsModalProps) {
    const { disableScroll, enableScroll } = useScrollLock();
    const t = dict[lang] ?? dict.ua;

    useEffect(() => {
        if (isOpen) {
            disableScroll();
            return () => enableScroll();
        }
    }, [isOpen, disableScroll, enableScroll]);

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className={{
                base: s.modalWrapper,
                afterOpen: s.modalWrapperOpen,
                beforeClose: s.modalWrapperBeforeClose,
            }}
            overlayClassName={{
                base: s.overlay,
                afterOpen: s.overlayAfterOpen,
                beforeClose: s.overlayBeforeClose,
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

                <h3 className={s.title}>{t.title}</h3>
                <p className={s.subtitle}>{t.subtitle}</p>

                <ul className={s.productList}>
                    {products.map((product) => (
                        <li key={product.id} className={s.productItem}>
                            <span className={s.productName}>{product.name}</span>
                            <span className={s.productQty}>
                                {product.quantity} {t.unit}
                            </span>
                        </li>
                    ))}
                </ul>

                <Button
                    variant="red"
                    className={s.confirmBtn}
                    onClick={onClose}
                >
                    {t.closeBtn}
                </Button>
            </div>
        </Modal>
    );
}
