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
import Button from "@/app/components/ui/Button/Button";

interface CartModalProps {
    isOpen: boolean;
    onClose: () => void;
    isCheckoutMode?: boolean;
}

export default function CartModal({ isOpen, onClose, isCheckoutMode = false }: CartModalProps) {
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
                            <path d="M3.57532 5.99551C2.82203 10.329 9.95312 11.0512 9.57446 5.99551M3.57532 4.10525C2.82203 -0.228233 9.95312 -0.950481 9.57446 4.10525M0.578125 4.55101H12.5781V12.1346C12.5781 12.9324 11.9066 13.5791 11.0781 13.5791H2.07812C1.2497 13.5791 0.578125 12.9324 0.578125 12.1346V4.55101Z" stroke="black" strokeWidth="1.15789" strokeLinecap="round" strokeLinejoin="round"/>
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
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                        <path d="M8.23286 6.99925L13.7414 1.4989C13.906 1.33424 13.9985 1.11091 13.9985 0.878038C13.9985 0.645168 13.906 0.421835 13.7414 0.257171C13.5767 0.0925073 13.3534 0 13.1206 0C12.8877 0 12.6644 0.0925073 12.4998 0.257171L7 5.76627L1.50024 0.257171C1.33559 0.0925073 1.11228 2.06752e-07 0.879436 2.08487e-07C0.646591 2.10222e-07 0.423282 0.0925073 0.258636 0.257171C0.0939896 0.421835 0.0014924 0.645168 0.0014924 0.878038C0.0014924 1.11091 0.0939896 1.33424 0.258636 1.4989L5.76714 6.99925L0.258636 12.4996C0.176683 12.5809 0.111635 12.6776 0.067245 12.7842C0.0228546 12.8907 0 13.005 0 13.1205C0 13.2359 0.0228546 13.3502 0.067245 13.4568C0.111635 13.5633 0.176683 13.66 0.258636 13.7413C0.33992 13.8233 0.436626 13.8884 0.543175 13.9327C0.649725 13.9771 0.764009 14 0.879436 14C0.994863 14 1.10915 13.9771 1.2157 13.9327C1.32225 13.8884 1.41895 13.8233 1.50024 13.7413L7 8.23224L12.4998 13.7413C12.581 13.8233 12.6778 13.8884 12.7843 13.9327C12.8909 13.9771 13.0051 14 13.1206 14C13.236 14 13.3503 13.9771 13.4568 13.9327C13.5634 13.8884 13.6601 13.8233 13.7414 13.7413C13.8233 13.66 13.8884 13.5633 13.9328 13.4568C13.9771 13.3502 14 13.2359 14 13.1205C14 13.005 13.9771 12.8907 13.9328 12.7842C13.8884 12.6776 13.8233 12.5809 13.7414 12.4996L8.23286 6.99925Z" fill="black"/>
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
                                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none">
                                            <path d="M9.8505 7.4305H7.359C7.21313 7.4305 7.07324 7.48845 6.97009 7.59159C6.86695 7.69474 6.809 7.83463 6.809 7.9805C6.809 8.12637 6.86695 8.26626 6.97009 8.36941C7.07324 8.47255 7.21313 8.5305 7.359 8.5305H8.679C8.07232 9.1645 7.28992 9.60262 6.43234 9.78857C5.57476 9.97451 4.68116 9.89978 3.86638 9.57399C3.05159 9.24819 2.35283 8.68621 1.85987 7.96024C1.36692 7.23428 1.1023 6.37751 1.1 5.5C1.1 5.35413 1.04205 5.21424 0.938909 5.11109C0.835764 5.00795 0.695869 4.95 0.55 4.95C0.404131 4.95 0.264236 5.00795 0.161091 5.11109C0.0579462 5.21424 0 5.35413 0 5.5C0.00290766 6.57404 0.320222 7.62372 0.912782 8.51952C1.50534 9.41531 2.34722 10.118 3.33451 10.5409C4.3218 10.9637 5.4113 11.0883 6.46856 10.8992C7.52582 10.71 8.50456 10.2154 9.284 9.4765V10.45C9.284 10.5959 9.34195 10.7358 9.44509 10.8389C9.54824 10.9421 9.68813 11 9.834 11C9.97987 11 10.1198 10.9421 10.2229 10.8389C10.3261 10.7358 10.384 10.5959 10.384 10.45V7.975C10.3826 7.8329 10.3263 7.69684 10.2269 7.59533C10.1274 7.49383 9.99254 7.43476 9.8505 7.4305ZM5.5 0C4.09001 0.00402171 2.73542 0.549403 1.716 1.5235V0.55C1.716 0.404131 1.65805 0.264236 1.55491 0.161091C1.45176 0.0579462 1.31187 0 1.166 0C1.02013 0 0.880236 0.0579462 0.777091 0.161091C0.673946 0.264236 0.616 0.404131 0.616 0.55V3.025C0.616 3.17087 0.673946 3.31076 0.777091 3.41391C0.880236 3.51705 1.02013 3.575 1.166 3.575H3.641C3.78687 3.575 3.92676 3.51705 4.02991 3.41391C4.13305 3.31076 4.191 3.17087 4.191 3.025C4.191 2.87913 4.13305 2.73924 4.02991 2.63609C3.92676 2.53295 3.78687 2.475 3.641 2.475H2.321C2.92736 1.84133 3.70925 1.40332 4.56632 1.21721C5.42339 1.03109 6.31652 1.10536 7.13108 1.43047C7.94564 1.75559 8.64446 2.31672 9.13783 3.04183C9.6312 3.76695 9.89661 4.62296 9.9 5.5C9.9 5.64587 9.95795 5.78576 10.0611 5.88891C10.1642 5.99205 10.3041 6.05 10.45 6.05C10.5959 6.05 10.7358 5.99205 10.8389 5.88891C10.9421 5.78576 11 5.64587 11 5.5C11 4.77773 10.8577 4.06253 10.5813 3.39524C10.3049 2.72795 9.89981 2.12163 9.38909 1.61091C8.87837 1.10019 8.27205 0.695063 7.60476 0.418663C6.93747 0.142262 6.22227 0 5.5 0Z" fill="black"/>
                                        </svg>
                                        <span>Кешбек балами:</span>
                                    </div>
                                    <span className={s.statValBlack}>180 Б</span>
                                </div>
                                <div className={s.statRow}>
                                    <div className={s.statLabel}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none">
                                            <path d="M3.85 5.50109H2.75C2.60413 5.50109 2.46424 5.55903 2.36109 5.66215C2.25795 5.76528 2.2 5.90514 2.2 6.05098C2.2 6.19682 2.25795 6.33669 2.36109 6.43981C2.46424 6.54294 2.60413 6.60087 2.75 6.60087H3.85C3.99587 6.60087 4.13577 6.54294 4.23891 6.43981C4.34206 6.33669 4.4 6.19682 4.4 6.05098C4.4 5.90514 4.34206 5.76528 4.23891 5.66215C4.13577 5.55903 3.99587 5.50109 3.85 5.50109ZM3.3 4.40131H5.5C5.64587 4.40131 5.78577 4.34338 5.88891 4.24025C5.99206 4.13713 6.05 3.99726 6.05 3.85142C6.05 3.70558 5.99206 3.56571 5.88891 3.46259C5.78577 3.35946 5.64587 3.30153 5.5 3.30153H3.3C3.15413 3.30153 3.01424 3.35946 2.91109 3.46259C2.80795 3.56571 2.75 3.70558 2.75 3.85142C2.75 3.99726 2.80795 4.13713 2.91109 4.24025C3.01424 4.34338 3.15413 4.40131 3.3 4.40131ZM3.85 7.70066H2.75C2.60413 7.70066 2.46424 7.75859 2.36109 7.86171C2.25795 7.96484 2.2 8.10471 2.2 8.25055C2.2 8.39639 2.25795 8.53625 2.36109 8.63938C2.46424 8.7425 2.60413 8.80044 2.75 8.80044H3.85C3.99587 8.80044 4.13577 8.7425 4.23891 8.63938C4.34206 8.53625 4.4 8.39639 4.4 8.25055C4.4 8.10471 4.34206 7.96484 4.23891 7.86171C4.13577 7.75859 3.99587 7.70066 3.85 7.70066ZM10.45 5.50109H8.8V0.552076C8.80039 0.45518 8.77515 0.359903 8.72686 0.275891C8.67857 0.19188 8.60893 0.122119 8.525 0.0736714C8.44139 0.0254084 8.34655 0 8.25 0C8.15346 0 8.05861 0.0254084 7.975 0.0736714L6.325 1.01948L4.675 0.0736714C4.59139 0.0254084 4.49655 0 4.4 0C4.30346 0 4.20861 0.0254084 4.125 0.0736714L2.475 1.01948L0.825004 0.0736714C0.741393 0.0254084 0.646549 0 0.550004 0C0.453459 0 0.358615 0.0254084 0.275004 0.0736714C0.191072 0.122119 0.121434 0.19188 0.0731423 0.275891C0.0248505 0.359903 -0.000380426 0.45518 4.33558e-06 0.552076V9.35033C4.33558e-06 9.78785 0.173843 10.2074 0.483278 10.5168C0.792713 10.8262 1.2124 11 1.65 11H9.35C9.78761 11 10.2073 10.8262 10.5167 10.5168C10.8262 10.2074 11 9.78785 11 9.35033V6.05098C11 5.90514 10.9421 5.76528 10.8389 5.66215C10.7358 5.55903 10.5959 5.50109 10.45 5.50109ZM1.65 9.90022C1.50413 9.90022 1.36424 9.84228 1.2611 9.73916C1.15795 9.63603 1.1 9.49617 1.1 9.35033V1.50339L2.2 2.13026C2.28489 2.17459 2.37924 2.19774 2.475 2.19774C2.57077 2.19774 2.66512 2.17459 2.75 2.13026L4.4 1.18445L6.05 2.13026C6.13489 2.17459 6.22923 2.19774 6.325 2.19774C6.42077 2.19774 6.51512 2.17459 6.6 2.13026L7.7 1.50339V9.35033C7.70149 9.53792 7.73497 9.72388 7.799 9.90022H1.65ZM9.9 9.35033C9.9 9.49617 9.84205 9.63603 9.73891 9.73916C9.63576 9.84228 9.49587 9.90022 9.35 9.90022C9.20413 9.90022 9.06424 9.84228 8.96109 9.73916C8.85795 9.63603 8.8 9.49617 8.8 9.35033V6.60087H9.9V9.35033ZM6.358 7.79414C6.32734 7.77333 6.29405 7.75668 6.259 7.74465C6.22625 7.7279 6.19093 7.71675 6.1545 7.71165C6.06614 7.69396 5.97479 7.69825 5.88847 7.72414C5.80216 7.75003 5.72353 7.79673 5.6595 7.86012C5.559 7.9655 5.50203 8.10495 5.5 8.25055C5.49913 8.32204 5.5122 8.39302 5.5385 8.4595C5.5684 8.52633 5.6093 8.58767 5.6595 8.64097C5.71296 8.68954 5.77435 8.7286 5.841 8.75645C5.90684 8.78554 5.97802 8.80056 6.05 8.80056C6.12198 8.80056 6.19317 8.78554 6.259 8.75645C6.32565 8.7286 6.38704 8.68954 6.4405 8.64097C6.49148 8.58959 6.53181 8.52865 6.55918 8.46165C6.58655 8.39466 6.60042 8.32292 6.6 8.25055C6.59798 8.10495 6.54101 7.9655 6.4405 7.86012C6.41437 7.83648 6.38682 7.81444 6.358 7.79414ZM6.435 5.66056C6.37078 5.59803 6.29224 5.55214 6.20623 5.52689C6.12022 5.50164 6.02934 5.4978 5.9415 5.51569C5.85366 5.53358 5.77152 5.57266 5.70225 5.62954C5.63297 5.68642 5.57864 5.75936 5.544 5.84202C5.50977 5.92533 5.49653 6.01577 5.50544 6.10539C5.51435 6.19502 5.54515 6.28108 5.59511 6.35601C5.64508 6.43095 5.7127 6.49247 5.79201 6.53517C5.87133 6.57786 5.95992 6.60043 6.05 6.60087C6.19587 6.60087 6.33577 6.54294 6.43891 6.43981C6.54206 6.33669 6.6 6.19682 6.6 6.05098C6.59913 5.97913 6.58418 5.90813 6.556 5.84202C6.5295 5.77338 6.48819 5.71142 6.435 5.66056Z" fill="black"/>
                                        </svg>
                                        <span>Загальна сума:</span>
                                    </div>
                                    <span className={s.statValRed}>{totalSum} ₴</span>
                                </div>
                            </div>
                            <div className={s.actionButtons}>
                                {isCheckoutMode ? (
                                    <Button variant="red" className={s.btnApply} onClick={onClose}>
                                        Застосувати
                                    </Button>
                                ) : (
                                    <>
                                        <Button variant='outline-black' className={(s.btnOutline)} onClick={onClose}>
                                            Продовжити покупки
                                        </Button>
                                        <Button variant='red' className={s.btnSolid} href="/checkout?step=1">
                                            Оформити замовлення
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className={s.suggestedBlock}>
                            <div className={s.suggestedHeader}>
                                <h3 className={s.suggestedTitle}>Разом дешевше</h3>
                            </div>
                            <div className={s.suggestedCarousel}>
                                <button className={clsx(s.navArrow, s.navPrev)} ref={setPrevEl}>
                                    <svg width="13" height="10" viewBox="0 0 13 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5.10934 0.499962L0.706955 4.90234L5.10934 9.30473" stroke="black" strokeLinecap="round"/>
                                        <line x1="0.5" y1="-0.5" x2="10.6304" y2="-0.5" transform="matrix(1 -8.74228e-08 -8.74228e-08 -1 0.925781 4.09766)" stroke="black" strokeLinecap="round"/>
                                    </svg>
                                </button>
                                <Swiper
                                    modules={[Navigation]}
                                    navigation={{ prevEl, nextEl }}
                                    slidesPerView={1.6}
                                    spaceBetween={12}
                                    loop={true}
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
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
                                                            <circle cx="11" cy="11" r="11" fill="black"/>
                                                            <path d="M11.5615 9.97559H14.666V11.1045H11.5615V14.208H10.4336V11.1045H7.33203V9.97559H10.4336V6.875H11.5615V9.97559Z" fill="white"/>
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                                <button className={clsx(s.navArrow, s.navNext)} ref={setNextEl}>
                                    <svg width="13" height="10" viewBox="0 0 13 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6.94926 0.499962L11.3516 4.90234L6.94926 9.30473" stroke="black" strokeLinecap="round"/>
                                        <line x1="10.6328" y1="4.59766" x2="0.502379" y2="4.59766" stroke="black" strokeLinecap="round"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
