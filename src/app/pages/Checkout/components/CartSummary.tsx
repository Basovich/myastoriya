'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getLocalizedHref } from '@/utils/i18n-helpers';
import { Locale } from '@/i18n/config';
import { useCartProducts } from '@/hooks/useCartProducts';
import s from './CheckoutShared.module.scss';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useIsHydrated } from '@/hooks/useIsHydrated';
import Spinner from '@/app/components/ui/Spinner/Spinner';
import { useParams } from 'next/navigation';
import { toggleUseBonusesAsync } from '@/store/slices/cartSlice';


const getModifierIconUrl = (name?: string | null): string | null => {
    if (!name) return null;
    const lower = name.toLowerCase();
    if (lower.includes('кола') || lower.includes('cola') || lower.includes('fanta') || lower.includes('фанта') || lower.includes('сік') || lower.includes('сок') || lower.includes('напиток') || lower.includes('напій')) {
        return '/images/modifiers/drink.png';
    }
    if (lower.includes('соус') || lower.includes('кетчуп') || lower.includes('майонез') || lower.includes('гірчиця') || lower.includes('горчица') || lower.includes('чилі') || lower.includes('чили') || lower.includes('барбекю') || lower.includes('bbq')) {
        return '/images/modifiers/sauce.png';
    }
    if (lower.includes('вино') || lower.includes('пиво') || lower.includes('алкоголь') || lower.includes('шампан')) {
        return '/images/modifiers/wine.png';
    }
    return null;
};

interface CartSummaryProps {
    onEditCart: () => void;
    discountPercent?: number;
    deliveryPrice?: number;
}

export default function CartSummary({ onEditCart, discountPercent = 0, deliveryPrice }: CartSummaryProps) {
    const hydrated = useIsHydrated();
    const dispatch = useAppDispatch();
    const params = useParams();
    const lang = params?.lang as string;
    const isRu = lang === 'ru';

    const { populatedItems, loading } = useCartProducts();
    const promoCode = useAppSelector(state => state.cart.promoCode);
    const cashback = useAppSelector(state => state.cart.cashback);
    const useBonuses = useAppSelector(state => state.cart.useBonuses);
    const backendTotal = useAppSelector(state => state.cart.total);
    const cartLoading = useAppSelector(state => state.cart.loading);
    const { user, isAuthenticated, isGuest } = useAppSelector(state => state.auth);

    const totalSum = useMemo(() => {
        return populatedItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    }, [populatedItems]);

    const originalTotalSum = useMemo(() => {
        return populatedItems.reduce((acc, item) => {
            const origPrice = item.product.originalPrice || item.product.price;
            return acc + (origPrice * item.quantity);
        }, 0);
    }, [populatedItems]);

    const discountAmount = useMemo(() => {
        if (promoCode && promoCode.isApplied && promoCode.discount) {
            const discountStr = promoCode.discount;
            const value = parseFloat(discountStr.replace(/[^\d.]/g, '')) || 0;
            if (discountStr.includes('%')) {
                return Math.round(totalSum * (value / 100));
            }
            return value;
        }
        return Math.round(totalSum * (discountPercent / 100));
    }, [promoCode, discountPercent, totalSum]);

    if (!hydrated || loading) {
        return (
            <div className={s.cartSummary}>
                <div className={s.cartLoading}>
                    <Spinner />
                </div>
            </div>
        );
    }

    const delivery = deliveryPrice !== undefined ? deliveryPrice : 0;

    const finalPrice = (backendTotal > 0 ? backendTotal : (totalSum - discountAmount)) + delivery;
    const originalPrice = originalTotalSum + delivery;
    const hasAnyDiscount = (originalTotalSum > totalSum) || (discountAmount > 0) || (backendTotal > 0 && backendTotal < totalSum);

    return (
        <div className={s.cartSummary}>
            {cartLoading && (
                <div className={s.loadingOverlay}>
                    <Spinner />
                </div>
            )}
            <div className={s.cartHeader}>
                <div className={s.cartTitle}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="15" viewBox="0 0 14 15" fill="none">
                        <path
                            d="M3.57532 5.99551C2.82203 10.329 9.95312 11.0512 9.57446 5.99551M3.57532 4.10525C2.82203 -0.228233 9.95312 -0.950481 9.57446 4.10525M0.578125 4.55101H12.5781V12.1346C12.5781 12.9324 11.9066 13.5791 11.0781 13.5791H2.07812C1.2497 13.5791 0.578125 12.9324 0.578125 12.1346V4.55101Z"
                            stroke="black"
                            strokeWidth="1.15789"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    Ваш кошик
                </div>
                <button className={s.editCartBtn} aria-label="Редагувати кошик" onClick={onEditCart} type="button">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.8 1.4L12.6 4.2L4.2 12.6H1.4V9.8L9.8 1.4Z" stroke="black" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Редагувати кошик</span>
                </button>
            </div>

            <div className={s.cartDivider} />

            <div className={s.cartItems}>
                {populatedItems.length === 0 ? (
                    <p className={s.emptyCart}>Кошик порожній</p>
                ) : (
                    [...populatedItems].reverse().map(item => (
                        <div key={item.rowId || item.id} className={s.cartItem}>
                            <div className={s.cartItemImg}>
                                <Link href={getLocalizedHref(`/products/${item.product.slug || item.id}`, lang as Locale)} target="_blank">
                                    <Image
                                        src={item.product.image}
                                        alt={item.product.title}
                                        width={84}
                                        height={60}
                                        className={s.cartImg}
                                    />
                                </Link>
                            </div>
                            <div className={s.cartItemInfo}>
                                <p className={s.cartItemTitle}>
                                    <Link href={getLocalizedHref(`/products/${item.product.slug || item.id}`, lang as Locale)} target="_blank">
                                        {item.product.title}
                                    </Link>
                                </p>
                                <p className={s.cartItemWeight}>
                                    {item.product.weight}
                                    {item.product.costVariantName && ` • ${item.product.costVariantName}`}
                                </p>
                                {item.product.modifiers && item.product.modifiers.length > 0 && (
                                     <div className={s.modifierIconsList}>
                                         {item.product.modifiers.map(m => {
                                             const iconUrl = m.image || getModifierIconUrl(m.name);
                                             return (
                                                 <div key={m.id} className={s.modifierIconWrapper} title={m.name || undefined}>
                                                     {iconUrl ? (
                                                         <Image
                                                             src={iconUrl}
                                                             alt={m.name || ''}
                                                             title={m.name || undefined}
                                                             width={24}
                                                             height={24}
                                                             className={s.modifierIcon}
                                                         />
                                                     ) : (
                                                         <div className={s.modifierFallback}>
                                                             <svg width="10" height="13" viewBox="0 0 27 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                                                                  <path 
                                                                     fillRule="evenodd" 
                                                                     clipRule="evenodd" 
                                                                     d="M20.2803 21.126C19.725 21.8862 17.7075 24.4049 15.2371 24.6605C15.0925 24.6743 14.9489 24.682 14.8104 24.682C10.2204 24.682 9.86347 17.0815 9.86347 14.7514V10.1408L10.0735 10.3362C11.4908 11.6558 11.765 12.9992 11.7417 14.6096C11.7949 15.6562 12.535 16.1279 13.2451 16.1279C13.9666 16.1279 14.7499 15.6465 14.7628 14.5892C14.7848 12.9239 14.9084 11.8067 16.4404 10.3379L16.6511 10.1351V19.5046C16.6511 20.3691 17.323 21.047 18.1801 21.047C19.0517 21.047 19.7081 20.3832 19.7081 19.5046V7.79939C19.7081 7.04992 19.1504 6.39681 18.4114 6.28104C18.3014 6.26197 18.1877 6.25227 18.0721 6.25227C16.4145 6.25227 14.3076 8.14803 13.3684 9.34351L13.2701 9.46865L13.1717 9.34284C12.2435 8.14937 10.1433 6.25461 8.45909 6.25461C8.24275 6.25461 8.03738 6.28706 7.84962 6.3513C7.25045 6.55406 6.83206 7.14996 6.83206 7.79939V14.9164C6.83206 15.3333 6.84435 15.7769 6.86529 16.1664C7.14012 21.23 8.68506 27.35 14.481 27.7468C14.6243 27.7561 14.7652 27.7608 14.9031 27.7608C16.0462 27.7608 17.095 27.4242 18.1103 26.7313L18.5273 26.4462L18.2907 26.8946C17.318 28.7341 15.4511 31.8401 13.8822 31.9672C13.8303 31.9746 13.7702 31.9786 13.71 31.9786C11.2369 31.9793 7.22453 25.1377 6.11658 22.5376C4.72981 19.2884 3.62452 15.5728 3.30184 13.0738L3.24967 12.689C2.88478 10.0214 2.62125 8.09383 5.10267 6.60626C5.22763 6.53131 5.90024 6.13549 6.1538 6.00501C8.55147 4.76603 14.5133 3.03722 18.7776 3.03722C21.3414 3.03722 22.8824 3.64617 23.3566 4.846C25.0896 8.56894 22.6318 18.2211 20.2803 21.126ZM24.3685 1.37917C23.1167 0.464071 21.2015 0 18.6759 0C13.4449 0 6.92182 2.00317 3.63785 3.93976C0.0189073 6.05401 -0.354951 9.04755 0.216304 13.1927C0.584513 15.7664 1.61769 19.9454 3.41321 23.9537C3.92165 25.09 8.53556 35.0563 13.7666 35.0563H13.7672C13.8493 35.0563 13.9311 35.0533 14.0138 35.0489C16.9612 34.8562 19.8832 31.3956 22.6986 24.7651C23.8036 22.1801 24.7205 19.6924 25.4243 17.3704C26.6798 13.1934 27.831 7.44221 26.1817 3.7564C25.7443 2.77105 25.3067 2.0654 24.3685 1.37917Z" 
                                                                     fill="#E3051B"
                                                                 />
                                                             </svg>
                                                         </div>
                                                     )}
                                                 </div>
                                             );
                                         })}
                                     </div>
                                )}
                            </div>
                            <div className={s.cartItemRight}>
                                <span className={s.cartItemPrice}>{item.product.price * item.quantity} ₴</span>
                                <span className={s.cartItemUnit}>упаковка</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {populatedItems.length > 0 && (
                <>
                    <div className={s.cartDivider} />

                    <div className={s.cartStats}>
                        {typeof cashback === 'number' && (
                            <div className={s.cartStat}>
                                <span className={s.cartStatLabel}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <path d="M12.537 9.457H9.366C9.18035 9.457 9.0023 9.53075 8.87103 9.66203C8.73975 9.7933 8.666 9.97135 8.666 10.157C8.666 10.3427 8.73975 10.5207 8.87103 10.652C9.0023 10.7832 9.18035 10.857 9.366 10.857H11.046C10.2739 11.6639 9.27808 12.2215 8.18661 12.4582C7.09515 12.6948 5.95785 12.5997 4.92084 12.1851C3.88384 11.7704 2.99451 11.0552 2.36711 10.1312C1.73972 9.20727 1.40292 8.11683 1.4 7C1.4 6.81435 1.32625 6.6363 1.19497 6.50503C1.0637 6.37375 0.885652 6.3 0.7 6.3C0.514348 6.3 0.336301 6.37375 0.205025 6.50503C0.0737498 6.6363 0 6.81435 0 7C0.00370066 8.36696 0.407555 9.70292 1.16172 10.843C1.91589 11.9831 2.98737 12.8775 4.24392 13.4157C5.50047 13.9539 6.88711 14.1124 8.23271 13.8716C9.57831 13.6309 10.824 13.0015 11.816 12.061V13.3C11.816 13.4857 11.8897 13.6637 12.021 13.795C12.1523 13.9263 12.3303 14 12.516 14C12.7017 14 12.8797 13.9263 13.011 13.795C13.1423 13.6637 13.216 13.4857 13.216 13.3V10.15C13.2143 9.96914 13.1426 9.79598 13.016 9.66679C12.8895 9.5376 12.7178 9.46242 12.537 9.457ZM7 0C5.20547 0.00511853 3.48144 0.69924 2.184 1.939V0.7C2.184 0.514348 2.11025 0.336301 1.97897 0.205025C1.8477 0.0737498 1.66965 0 1.484 0C1.29835 0 1.1203 0.0737498 0.989025 0.205025C0.85775 0.336301 0.784 0.514348 0.784 0.7V3.85C0.784 4.03565 0.85775 4.2137 0.989025 4.34497C1.1203 4.47625 1.29835 4.55 1.484 4.55H4.634C4.81965 4.55 4.9977 4.47625 5.12897 4.34497C5.26025 4.2137 5.334 4.03565 5.334 3.85C5.334 3.66435 5.26025 3.4863 5.12897 3.35503C4.9977 3.22375 4.81965 3.15 4.634 3.15H2.954C3.72573 2.34351 4.72086 1.78605 5.81168 1.54918C6.90249 1.3123 8.03921 1.40682 9.07592 1.8206C10.1126 2.23439 11.002 2.94855 11.63 3.87142C12.2579 4.7943 12.5957 5.88377 12.6 7C12.6 7.18565 12.6737 7.3637 12.805 7.49497C12.9363 7.62625 13.1143 7.7 13.3 7.7C13.4857 7.7 13.6637 7.62625 13.795 7.49497C13.9263 7.3637 14 7.18565 14 7C14 6.08075 13.8189 5.17049 13.4672 4.32122C13.1154 3.47194 12.5998 2.70026 11.9497 2.05025C11.2997 1.40024 10.5281 0.884626 9.67878 0.532843C8.8295 0.18106 7.91925 0 7 0Z" fill="#4F4F4F"/>
                                    </svg>
                                    Кешбек балами:
                                </span>
                                <span className={s.cartStatVal}>{cashback} Б</span>
                            </div>
                        )}


                        <div className={s.cartStat}>
                            <span className={s.cartStatLabel}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="12" viewBox="0 0 14 12" fill="none">
                                    <path d="M14 6.31579V9.47368C14 9.64119 13.933 9.80183 13.8136 9.92028C13.6943 10.0387 13.5324 10.1053 13.3636 10.1053H12.7273C12.7273 10.6078 12.5261 11.0897 12.1681 11.445C11.8101 11.8004 11.3245 12 10.8182 12C10.3119 12 9.82627 11.8004 9.46825 11.445C9.11023 11.0897 8.90909 10.6078 8.90909 10.1053H5.09091C5.09091 10.6078 4.88977 11.0897 4.53175 11.445C4.17373 11.8004 3.68814 12 3.18182 12C2.6755 12 2.18991 11.8004 1.83189 11.445C1.47386 11.0897 1.27273 10.6078 1.27273 10.1053H0.636364C0.467589 10.1053 0.305728 10.0387 0.186386 9.92028C0.0670452 9.80183 0 9.64119 0 9.47368V1.89474C0 1.39222 0.201136 0.910288 0.55916 0.554956C0.917184 0.199624 1.40277 0 1.90909 0H7.63636C8.14269 0 8.62827 0.199624 8.9863 0.554956C9.34432 0.910288 9.54545 1.39222 9.54545 1.89474V3.15789H10.8182C11.1146 3.15789 11.4069 3.22638 11.672 3.35793C11.937 3.48947 12.1676 3.68047 12.3455 3.91579L13.8727 5.93684C13.8913 5.96429 13.9063 5.99401 13.9173 6.02526L13.9555 6.09474C13.9835 6.16517 13.9986 6.24005 14 6.31579ZM3.81818 10.1053C3.81818 9.98035 3.78086 9.85824 3.71094 9.75438C3.64101 9.65051 3.54162 9.56956 3.42534 9.52176C3.30906 9.47396 3.18111 9.46145 3.05767 9.48582C2.93423 9.51019 2.82084 9.57034 2.73184 9.65867C2.64284 9.747 2.58224 9.85953 2.55768 9.98205C2.53313 10.1046 2.54573 10.2316 2.59389 10.347C2.64206 10.4624 2.72362 10.561 2.82827 10.6304C2.93292 10.6998 3.05596 10.7368 3.18182 10.7368C3.35059 10.7368 3.51245 10.6703 3.6318 10.5519C3.75114 10.4334 3.81818 10.2728 3.81818 10.1053ZM8.27273 1.89474C8.27273 1.72723 8.20568 1.56659 8.08634 1.44814C7.967 1.3297 7.80514 1.26316 7.63636 1.26316H1.90909C1.74032 1.26316 1.57845 1.3297 1.45911 1.44814C1.33977 1.56659 1.27273 1.72723 1.27273 1.89474V8.8421H1.76909C1.94803 8.64672 2.16613 8.49061 2.40941 8.38379C2.65269 8.27696 2.91579 8.22178 3.18182 8.22178C3.44785 8.22178 3.71094 8.27696 3.95423 8.38379C4.19751 8.49061 4.41561 8.64672 4.59455 8.8421H8.27273V1.89474ZM9.54545 5.68421H12.0909L11.3273 4.67368C11.268 4.59524 11.1911 4.53158 11.1028 4.48773C11.0144 4.44388 10.917 4.42105 10.8182 4.42105H9.54545V5.68421ZM11.4545 10.1053C11.4545 9.98035 11.4172 9.85824 11.3473 9.75438C11.2774 9.65051 11.178 9.56956 11.0617 9.52176C10.9454 9.47396 10.8175 9.46145 10.694 9.48582C10.5706 9.51019 10.4572 9.57034 10.3682 9.65867C10.2792 9.747 10.2186 9.85953 10.194 9.98205C10.1695 10.1046 10.1821 10.2316 10.2303 10.347C10.2784 10.4624 10.36 10.561 10.4646 10.6304C10.5693 10.6998 10.6923 10.7368 10.8182 10.7368C10.987 10.7368 11.1488 10.6703 11.268 10.5519C11.3875 10.4334 11.4545 10.2728 11.4545 10.1053ZM12.7273 6.94737H9.54545V8.70316C9.92102 8.37004 10.414 8.19771 10.917 8.22374C11.42 8.24977 11.8923 8.47203 12.2309 8.8421H12.7273V6.94737Z" fill="#4F4F4F"/>
                                </svg>
                                Доставка:
                            </span>
                            <span className={s.cartStatVal}>{deliveryPrice === undefined ? '—' : deliveryPrice === 0 ? 'Безкоштовно' : `${deliveryPrice} ₴`}</span>
                        </div>

                        <div className={s.cartStat}>
                            <span className={s.cartStatLabel}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M4.9 7.00139H3.5C3.31435 7.00139 3.13631 7.07513 3.00503 7.20638C2.87375 7.33763 2.8 7.51564 2.8 7.70125C2.8 7.88687 2.87375 8.06488 3.00503 8.19613C3.13631 8.32738 3.31435 8.40111 3.5 8.40111H4.9C5.08566 8.40111 5.2637 8.32738 5.39498 8.19613C5.52625 8.06488 5.6 7.88687 5.6 7.70125C5.6 7.51564 5.52625 7.33763 5.39498 7.20638C5.2637 7.07513 5.08566 7.00139 4.9 7.00139ZM4.2 5.60167H7C7.18565 5.60167 7.3637 5.52793 7.49498 5.39668C7.62625 5.26543 7.7 5.08742 7.7 4.90181C7.7 4.71619 7.62625 4.53818 7.49498 4.40693C7.3637 4.27568 7.18565 4.20195 7 4.20195H4.2C4.01435 4.20195 3.83631 4.40693 3.70503 4.40693C3.57375 4.53818 3.5 4.71619 3.5 4.90181C3.5 5.08742 3.57375 5.26543 3.70503 5.39668C3.83631 5.52793 4.01435 5.60167 4.2 5.60167ZM4.9 9.80083H3.5C3.31435 9.80083 3.13631 9.87457 3.00503 10.0058C2.87375 10.1371 2.8 10.3151 2.8 10.5007C2.8 10.6863 2.87375 10.8643 3.00503 10.9956C3.13631 11.1268 3.31435 11.2006 3.5 11.2006H4.9C5.08566 11.2006 5.2637 11.1268 5.39498 10.9956C5.52625 10.8643 5.6 10.6863 5.6 10.5007C5.6 10.3151 5.52625 10.1371 5.39498 10.0058C5.2637 9.87457 5.08566 9.80083 4.9 9.80083ZM13.3 7.00139H11.2V0.702643C11.2005 0.57932 11.1684 0.458058 11.1069 0.351135C11.0455 0.244211 10.9568 0.155424 10.85 0.0937636C10.7436 0.032338 10.6229 0 10.5 0C10.3771 0 10.2564 0.032338 10.15 0.0937636L8.05 1.29752L5.95 0.0937636C5.84359 0.032338 5.72288 0 5.6 0C5.47713 0 5.35642 0.032338 5.25 0.0937636L3.15 1.29752L1.05001 0.0937636C0.943592 0.032338 0.822881 0 0.700005 0C0.57713 0 0.456419 0.032338 0.350005 0.0937636C0.243182 0.155424 0.154553 0.244211 0.0930902 0.351135C0.0316279 0.458058 -0.000484179 0.57932 5.51802e-06 0.702643V11.9004C5.51802e-06 12.4573 0.221255 12.9913 0.615081 13.385C1.00891 13.7788 1.54305 14 2.1 14H11.9C12.457 14 12.9911 13.7788 13.3849 13.385C13.7788 12.9913 14 12.4573 14 11.9004V7.70125C14 7.51564 13.9263 7.33763 13.795 7.20638C13.6637 7.07513 13.4857 7.00139 13.3 7.00139ZM2.1 12.6003C1.91435 12.6003 1.73631 12.5265 1.60503 12.3953C1.47375 12.264 1.4 12.086 1.4 11.9004V1.9134L2.8 2.71124C2.90804 2.76766 3.02812 2.79712 3.15 2.79712C3.27189 2.79712 3.39197 2.76766 3.5 2.71124L5.6 1.50748L7.7 2.71124C7.80804 2.76766 7.92812 2.79712 8.05 2.79712C8.17189 2.79712 8.29197 2.76766 8.4 2.71124L9.8 1.9134V11.9004C9.8019 12.1392 9.84451 12.3759 9.926 12.6003H2.1ZM12.6 11.9004C12.6 12.086 12.5263 12.264 12.395 12.3953C12.2637 12.5265 12.0857 12.6003 11.9 12.6003C11.7143 12.6003 11.5363 12.5265 11.405 12.3953C11.2738 12.264 11.2 12.086 11.2 11.9004V8.40111H12.6V11.9004ZM8.092 9.91981C8.05298 9.89332 8.01061 9.87214 7.966 9.85682C7.92432 9.83551 7.87937 9.82132 7.833 9.81483C7.72054 9.79232 7.60428 9.79778 7.49442 9.83073C7.38457 9.86368 7.28449 9.92311 7.203 10.0038C7.07509 10.1379 7.00258 10.3154 7 10.5007C6.99889 10.5917 7.01553 10.682 7.049 10.7666C7.08705 10.8517 7.13911 10.9298 7.203 10.9976C7.27104 11.0594 7.34917 11.1091 7.434 11.1446C7.51779 11.1816 7.60839 11.2007 7.7 11.2007C7.79161 11.2007 7.88221 11.1816 7.966 11.1446C8.05083 11.1091 8.12896 11.0594 8.197 10.9976C8.26188 10.9322 8.31321 10.8546 8.34804 10.7694C8.38288 10.6841 8.40053 10.5928 8.4 10.5007C8.39742 10.3154 8.32492 10.1379 8.197 10.0038C8.16374 9.9737 8.12867 9.94565 8.092 9.91981ZM8.19 7.20435C8.10826 7.12477 8.00831 7.06637 7.89884 7.03423C7.78937 7.00209 7.6737 6.9972 7.56191 7.01996C7.45011 7.04273 7.34558 7.09248 7.2574 7.16487C7.16923 7.23726 7.10009 7.3301 7.056 7.43531C7.01243 7.54133 6.99558 7.65644 7.00692 7.7705C7.01827 7.88457 7.05746 7.9941 7.12105 8.08947C7.18465 8.18485 7.2707 8.26315 7.37165 8.31749C7.4726 8.37183 7.58535 8.40054 7.7 8.40111C7.88565 8.40111 8.0637 8.32738 8.19498 8.19613C8.32625 8.06488 8.4 7.88687 8.4 7.70125C8.3989 7.6098 8.37987 7.51944 8.344 7.43531C8.31028 7.34794 8.2577 7.26908 8.19 7.20435Z" fill="#4F4F4F"/>
                                </svg>
                                Загальна сума:
                            </span>
                            <div className={s.priceBlock}>
                                <span className={s.cartStatVal}>
                                    {finalPrice} ₴
                                </span>
                                {hasAnyDiscount && (
                                    <span className={s.oldPrice}>
                                        {originalPrice} ₴
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {hydrated && isAuthenticated && !isGuest && (user?.bonuses ?? 0) > 0 && (
                        <>
                            <div className={s.cartDivider} />
                            <div className={s.bonusesBlock}>
                                <span className={s.bonusesLabel}>
                                    {isRu ? 'Использовать бонусы' : 'Використати бонуси'} ({user?.bonuses})
                                </span>
                                <label className={s.toggleSwitch}>
                                    <input 
                                        type="checkbox" 
                                        checked={useBonuses} 
                                        onChange={(e) => {
                                            void dispatch(toggleUseBonusesAsync(e.target.checked));
                                        }} 
                                    />
                                    <span className={s.toggleSlider} />
                                </label>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}
