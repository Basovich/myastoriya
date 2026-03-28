'use client';

import { useEffect, useMemo, useState } from 'react';
import Modal from 'react-modal';
import Image from 'next/image';
import s from './CartModal.module.scss';
import useScrollLock from '@/hooks/useScrollLock';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToCart, updateQuantity, removeFromCart } from '@/store/slices/cartSlice';
import { MOCK_PRODUCTS, FALLBACK_PRODUCT } from './products_mock';
import clsx from 'clsx';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

interface CartModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
    const { disableScroll, enableScroll } = useScrollLock();
    const dispatch = useAppDispatch();
    const cartItems = useAppSelector(state => state.cart.items);

    const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
    const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);

    // Catalog out invalid items and map to mock product data
    const populatedItems = useMemo(() => {
        return cartItems.map(item => {
            const product = MOCK_PRODUCTS[item.id] || FALLBACK_PRODUCT;
            return {
                ...item,
                product
            };
        });
    }, [cartItems]);

    // Calculate total
    const totalSum = useMemo(() => {
        return populatedItems.reduce((acc, item) => {
            return acc + (item.product.price * item.quantity);
        }, 0);
    }, [populatedItems]);

    useEffect(() => {
        if (isOpen) {
            disableScroll();
            return () => enableScroll();
        }
    }, [isOpen, disableScroll, enableScroll]);

    const handleUpdateQuantity = (id: string, newQuantity: number) => {
        if (newQuantity < 1) return;
        dispatch(updateQuantity({ id, quantity: newQuantity }));
    };

    const handleRemove = (id: string) => {
        dispatch(removeFromCart(id));
    };

    const handleAddToCart = (id: string) => {
        dispatch(addToCart({ id, quantity: 1 }));
    };

    // Catalog MOCK_PRODUCTS to show as suggestions (those not already in cart)
    const suggestedProducts = useMemo(() => {
        const inCartIds = new Set(cartItems.map(item => item.id));
        return Object.values(MOCK_PRODUCTS).filter(p => !inCartIds.has(p.id));
    }, [cartItems]);

    const itemsToDisplay = suggestedProducts.length > 0 ? suggestedProducts : Object.values(MOCK_PRODUCTS);

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className={s.modalWrapper}
            overlayClassName={s.overlay}
            ariaHideApp={false}
            closeTimeoutMS={200}
        >
            <button className={s.closeBtn} onClick={onClose} aria-label="Закрити кошик">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M11.7625 9.99893L19.6326 2.14129C19.8678 1.90606 20 1.58701 20 1.25434C20 0.921668 19.8678 0.602622 19.6326 0.367388C19.3974 0.132153 19.0783 0 18.7457 0C18.413 0 18.0939 0.132153 17.8587 0.367388L10.0011 8.23752L2.14342 0.367388C1.90819 0.132153 1.58914 2.95361e-07 1.25647 2.97839e-07C0.9238 3.00318e-07 0.604754 0.132153 0.369519 0.367388C0.134285 0.602622 0.00213223 0.921668 0.00213223 1.25434C0.00213223 1.58701 0.134285 1.90606 0.369519 2.14129L8.23966 9.99893L0.369519 17.8566C0.252431 17.9727 0.159496 18.1109 0.0960746 18.2631C0.0326529 18.4153 0 18.5786 0 18.7435C0 18.9084 0.0326529 19.0717 0.0960746 19.224C0.159496 19.3762 0.252431 19.5143 0.369519 19.6305C0.485651 19.7476 0.623817 19.8405 0.776047 19.9039C0.928277 19.9673 1.09156 20 1.25647 20C1.42138 20 1.58467 19.9673 1.7369 19.9039C1.88913 19.8405 2.02729 19.7476 2.14342 19.6305L10.0011 11.7603L17.8587 19.6305C17.9748 19.7476 18.113 19.8405 18.2652 19.9039C18.4175 19.9673 18.5807 20 18.7457 20C18.9106 20 19.0739 19.9673 19.2261 19.9039C19.3783 19.8405 19.5165 19.7476 19.6326 19.6305C19.7497 19.5143 19.8426 19.3762 19.9061 19.224C19.9695 19.0717 20.0021 18.9084 20.0021 18.7435C20.0021 18.5786 19.9695 18.4153 19.9061 18.2631C19.8426 18.1109 19.7497 17.9727 19.6326 17.8566L11.7625 9.99893Z" fill="white" />
                </svg>
            </button>

            <div className={s.modal}>
                <div className={s.modalHeader}>
                    <h2 className={s.title}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="15" viewBox="0 0 14 15" fill="none">
                            <path d="M3.57532 5.99551C2.82203 10.329 9.95312 11.0512 9.57446 5.99551M3.57532 4.10525C2.82203 -0.228233 9.95312 -0.950481 9.57446 4.10525M0.578125 4.55101H12.5781V12.1346C12.5781 12.9324 11.9066 13.5791 11.0781 13.5791H2.07812C1.2497 13.5791 0.578125 12.9324 0.578125 12.1346V4.55101Z" stroke="black" stroke-width="1.15789" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Ваш кошик
                    </h2>
                </div>

                <div className={s.body}>
                    {populatedItems.length === 0 ? (
                        <div className={s.emptyState}>
                            Ваш кошик порожній.
                        </div>
                    ) : (
                        <div className={s.cartItems}>
                            {populatedItems.map((item) => (
                                <div key={item.id} className={s.cartItem}>
                                    <div className={s.itemImage}>
                                        <Image
                                            src={item.product.image}
                                            alt={item.product.title}
                                            width={80}
                                            height={80}
                                            className={s.image}
                                        />
                                    </div>
                                    <div className={s.itemDetails}>
                                        <div className={s.itemTop}>
                                            <div className={s.itemInfo}>
                                                <h3 className={s.itemTitle}>{item.product.title}</h3>
                                                <span className={s.itemWeight}>{item.product.weight}</span>
                                            </div>
                                        </div>
                                        <div className={s.itemBottom}>
                                            <div className={s.quantitySelector}>
                                                <button
                                                    className={s.qtyBtn}
                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    className={s.qtyInput}
                                                    value={item.quantity}
                                                    readOnly
                                                />
                                                <button
                                                    className={s.qtyBtn}
                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <div className={s.itemPriceBlock}>
                                                <div className={s.itemPriceCol}>
                                                    <span className={s.itemTotal}>{item.product.price * item.quantity} ₴</span>
                                                    <span className={s.itemUnitPrice}>{item.product.price} грн / шт</span>
                                                </div>
                                                <button
                                                    className={s.removeItemBtn}
                                                    onClick={() => handleRemove(item.id)}
                                                    aria-label="Видалити товар"
                                                >
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M18 6L6 18M6 6L18 18" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {populatedItems.length > 0 && (
                    <div className={s.modalFooter}>
                        <div className={s.footerContent}>
                            <div className={s.summaryStats}>
                                <div className={s.statRow}>
                                    <div className={s.statLabel}>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M13.6 8C13.6 11.0928 11.0928 13.6 8 13.6C4.90721 13.6 2.4 11.0928 2.4 8C2.4 4.90721 4.90721 2.4 8 2.4C9.55395 2.4 10.9599 3.0337 11.96 4.04505M11.96 4.04505V2M11.96 4.04505H9.92" stroke="#4F4F4F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <span>Кешбек балами:</span>
                                    </div>
                                    <span className={s.statValBlack}>180 Б</span>
                                </div>
                                <div className={s.statRow}>
                                    <div className={s.statLabel}>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M9.33333 2H4C3.26362 2 2.66667 2.59695 2.66667 3.33333V12.6667C2.66667 13.403 3.26362 14 4 14H12C12.7364 14 13.3333 13.403 13.3333 12.6667V6L9.33333 2Z" stroke="#4F4F4F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M9.33333 2V6H13.3333" stroke="#4F4F4F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <span>Загальна сума:</span>
                                    </div>
                                    <div className={s.statValTotals}>
                                        <span className={s.statValRed}>{totalSum} ₴</span>
                                        {totalSum > 0 && <span className={s.statValCrossed}>{totalSum + 740} ₴</span>}
                                    </div>
                                </div>
                            </div>
                            <div className={s.actionButtons}>
                                <button className={s.btnOutline} onClick={onClose}>
                                    Продовжити покупки
                                </button>
                                <button className={s.btnSolid}>
                                    Оформити замовлення
                                </button>
                            </div>
                        </div>

                        <div className={s.suggestedBlock}>
                            <div className={s.suggestedHeader}>
                                <h3 className={s.suggestedTitle}>Разом дешевше</h3>
                            </div>
                            <div className={s.suggestedCarousel}>
                                <button className={clsx(s.navArrow, s.navPrev)} ref={setPrevEl}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="12" cy="12" r="11.5" stroke="#060606" />
                                        <path fillRule="evenodd" clipRule="evenodd" d="M13.25 16L14.31 14.94L11.37 12L14.31 9.06L13.25 8L9.25 12L13.25 16Z" fill="#060606" />
                                    </svg>
                                </button>
                                <button className={clsx(s.navArrow, s.navNext)} ref={setNextEl}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="12" cy="12" r="11.5" stroke="#060606" />
                                        <path fillRule="evenodd" clipRule="evenodd" d="M10.75 16L9.69 14.94L12.63 12L9.69 9.06L10.75 8L14.75 12L10.75 16Z" fill="#060606" />
                                    </svg>
                                </button>
                                <Swiper
                                    modules={[Navigation]}
                                    navigation={{ prevEl, nextEl }}
                                    slidesPerView={1.8}
                                    spaceBetween={12}
                                    breakpoints={{
                                        768: {
                                            slidesPerView: 3,
                                            spaceBetween: 16
                                        }
                                    }}
                                    className={s.swiper}
                                >
                                    {itemsToDisplay.map((product) => (
                                        <SwiperSlide key={product.id} className={s.swiperSlide}>
                                            <div className={s.suggestedItem}>
                                                <div className={s.suggestedImgWrapper}>
                                                    <Image src={product.image} alt={product.title} width={100} height={70} className={s.sugImg} />
                                                </div>
                                                <div className={s.sugInfo}>
                                                    <div className={s.sugPriceRow}>
                                                        <span className={s.sugPriceRed}>{product.price} ₴</span>
                                                        <span className={s.sugPriceCrossed}>{Math.round(product.price * 1.2)} ₴</span>
                                                    </div>
                                                    <button className={s.sugAddBtn} onClick={() => handleAddToCart(product.id)}>
                                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <circle cx="10" cy="10" r="10" fill="#000" />
                                                            <path d="M10 5V15M5 10H15" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
