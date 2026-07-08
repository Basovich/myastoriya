'use client';

import React, { useState, useEffect, useCallback } from 'react';
import clsx from 'clsx';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { Locale } from '@/i18n/config';
import { useIsHydrated } from '@/hooks/useIsHydrated';
import PersonalContentBlock from '@/app/components/Personal/Shared/PersonalContentBlock';
import PersonalPageHeader from '@/app/components/Personal/Shared/PersonalPageHeader';
import { personalDict } from '@/app/components/Personal/Shared/PersonalShared';
import { logout } from '@/store/slices/authSlice';
import { logoutApi } from '@/lib/graphql/queries/auth';
import { clearAuthCookies, getAccessToken } from '@/app/actions/authActions';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ProductCard from '@/app/components/ui/ProductCard/ProductCard';
import OrderStatusTimeline, { StatusStep } from '../OrderStatusTimeline/OrderStatusTimeline';
import Button from '@/app/components/ui/Button/Button';
import Spinner from '@/app/components/ui/Spinner/Spinner';
import PersonalReviewModal from '@/app/components/Personal/Reviews/PersonalReviewModal/PersonalReviewModal';
import { fetchCartAsync } from '@/store/slices/cartSlice';
import {
    getOrderApi,
    repeatOrderApi,
    getProductsByIdsApi,
    resolveProductImageUrl,
    getOrderReviewsApi,
    Order,
    OrderStatus,
    OrderReview
} from '@/lib/graphql';
import { ModifierGroup } from '@/lib/graphql/queries/products';
import s from './OrderDetailsClient.module.scss';

const detailsDict = {
    ua: {
        orderTitle: "ЗАМОВЛЕННЯ",
        backToHistory: "Історія замовлень",
        sourcePrefix: "Замовлення:",
        sourceSite: "з сайту",
        sourceApp: "з додатку",
        productsHeading: "Ваше замовлення",
        summary: {
            persons: "Кількість персон",
            discount: "Розмір знижки",
            delivery: "Вартість доставки",
            total: "Вартість замовлення",
            unit: "чол."
        },
        statusHeading: "Статус замовлення",
        deliveryTime: "Час доставки",
        deliveryType: "Тип доставки",
        commentHeading: "Коментар до замовлення",
        repeatBtn: "ПОВТОРИТИ ЗАМОВЛЕННЯ",
        reviewBtn: "Залишити відгук",
        editReviewBtn: "Змінити відгук"
    },
    ru: {
        orderTitle: "ЗАКАЗ №",
        backToHistory: "История заказов",
        sourcePrefix: "Заказ:",
        sourceSite: "с сайта",
        sourceApp: "из приложения",
        productsHeading: "Ваш заказ",
        summary: {
            persons: "Количество персон",
            discount: "Размер скидки",
            delivery: "Стоимость доставки",
            total: "Стоимость заказа",
            unit: "чел."
        },
        statusHeading: "Статус заказа",
        deliveryTime: "Время доставки",
        deliveryType: "Тип доставки",
        commentHeading: "Комментарий к заказу",
        repeatBtn: "ПОВТОРИТЬ ЗАКАЗ",
        reviewBtn: "Оставить отзыв",
        editReviewBtn: "Изменить отзыв"
    }
};

const resolveOrderItemImageUrl = (
    itemId: string,
    image?: {
        list1x?: string | null;
        grid1x?: string | null;
        main1x?: string | null;
    } | null,
    productDetailsMap?: Record<number, { image: string; slug?: string; name: string; modifierGroups?: ModifierGroup[] | null }>
): string => {
    const productId = Number(itemId);
    if (productId && productDetailsMap?.[productId]) {
        return productDetailsMap[productId].image;
    }
    const url = image?.list1x || image?.grid1x || image?.main1x || null;
    if (!url) return '/images/product-placeholder.svg';
    if (url.startsWith('/images/')) return url;
    if (url.startsWith('/')) return `https://dev-api.myastoriya.com.ua${url}`;
    return url;
};

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

const formatOrderDateTime = (createdAt: string) => {
    try {
        const dateObj = new Date(createdAt);
        if (isNaN(dateObj.getTime())) {
            return { date: '', time: '' };
        }
        
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        
        return {
            date: `${day}.${month}.${year}`,
            time: `${hours}:${minutes}`
        };
    } catch {
        return { date: '', time: '' };
    }
};

interface OrderDetailsClientProps {
    lang: Locale;
    orderId: string;
}

export default function OrderDetailsClient({ lang, orderId }: OrderDetailsClientProps) {
    const hydrated = useIsHydrated();
    const dict = detailsDict[lang] || detailsDict.ua;
    const pDict = personalDict[lang] || personalDict.ua;
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { user } = useAppSelector((state) => state.auth);

    const [order, setOrder] = useState<Order | null>(null);
    const [productDetailsMap, setProductDetailsMap] = useState<Record<number, { image: string; slug?: string; name: string; modifierGroups?: ModifierGroup[] | null }>>({});
    const [orderReview, setOrderReview] = useState<OrderReview | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const token = await getAccessToken();
            if (!token) return;

            // 1. Fetch Order Details
            const orderData = await getOrderApi(Number(orderId), token, lang);
            if (!orderData) {
                setOrder(null);
                return;
            }
            setOrder(orderData);

            // 2. Fetch product details for slugs/images
            const productIds = Array.from(new Set(
                (orderData.items || [])
                    .map(item => Number(item.id))
                    .filter(id => !isNaN(id) && id > 0)
            ));

            const detailsMap: Record<number, { image: string; slug?: string; name: string; modifierGroups?: ModifierGroup[] | null }> = {};
            if (productIds.length > 0) {
                try {
                    const details = await getProductsByIdsApi(productIds, lang);
                    details.forEach(prod => {
                        detailsMap[Number(prod.id)] = {
                            image: resolveProductImageUrl(prod),
                            slug: prod.slug,
                            name: prod.name,
                            modifierGroups: prod.modifierGroups,
                        };
                    });
                } catch (e) {
                    console.error("Failed to fetch product details for images:", e);
                }
            }
            setProductDetailsMap(detailsMap);

            // 3. Fetch Order Review if order has reviewId
            if (orderData.reviewId) {
                try {
                    const reviewData = await getOrderReviewsApi(token, { orderId: Number(orderId) }, lang);
                    if (reviewData.data && reviewData.data.length > 0) {
                        setOrderReview(reviewData.data[0]);
                    }
                } catch (e) {
                    console.error("Failed to fetch order review:", e);
                }
            } else {
                setOrderReview(null);
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
        } finally {
            setLoading(false);
        }
    }, [orderId, lang]);

    useEffect(() => {
        if (hydrated && user) {
            loadData();
        }
    }, [hydrated, user, loadData]);

    const handleLogout = async () => {
        try {
            const token = await getAccessToken();
            if (token) await logoutApi(token);
        } catch {
            // Ignore
        } finally {
            await clearAuthCookies();
            dispatch(logout());
            router.replace('/');
        }
    };

    const handleRepeatOrder = async () => {
        if (!order) return;
        try {
            const token = await getAccessToken();
            if (!token) return;
            const success = await repeatOrderApi(order.id, token, lang);
            if (success) {
                await dispatch(fetchCartAsync()).unwrap();
                router.push(`/${lang}/checkout`);
            }
        } catch (error) {
            console.error('Failed to repeat order:', error);
        }
    };

    const handleLeaveReview = () => {
        setIsModalOpen(true);
    };

    if (!hydrated) {
        return null;
    }

    if (!hydrated) {
        return null;
    }

    const { date, time } = order ? formatOrderDateTime(order.createdAt) : { date: '', time: '' };
    
    // Sort statusHistory by date ascending
    const history = order ? (order.statusHistory || []).filter((h): h is OrderStatus => h !== null) : [];
    const sortedHistory = [...history].sort((a, b) => 
        new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
    );

    // Standard steps configuration
    const standardStepsDef = [
        { key: 'new', label: lang === 'ru' ? 'Новое заказ' : 'Нове замовлення', match: (h: OrderStatus) => h.id === '1' || (h.name || '').toLowerCase().includes('нов') },
        { key: 'preparing', label: lang === 'ru' ? 'Готовится' : 'Готується', match: (h: OrderStatus) => h.id === '4' || (h.name || '').toLowerCase().includes('готу') || (h.name || '').toLowerCase().includes('прийнят') },
        { key: 'courier', label: order?.delivery?.service?.toLowerCase().includes('самовивіз') || order?.delivery?.service?.toLowerCase().includes('самовывоз') 
            ? (lang === 'ru' ? 'Готово к выдаче' : 'Готово до видачі')
            : (lang === 'ru' ? 'Выдано курьеру' : 'Видано кур’єру'), 
          match: (h: OrderStatus) => h.id === '5' || (h.name || '').toLowerCase().includes('кур') || (h.name || '').toLowerCase().includes('відправл') },
        { key: 'delivered', label: lang === 'ru' ? 'Доставлено' : 'Доставлено', match: (h: OrderStatus) => h.id === '6' || (h.name || '').toLowerCase().includes('достав') },
        { key: 'completed', label: lang === 'ru' ? 'Завершено' : 'Завершено', match: (h: OrderStatus) => h.id === '2' || (h.name || '').toLowerCase().includes('викон') || (h.name || '').toLowerCase().includes('заверш') }
    ];

    // Map history to standard steps
    const statusSteps: StatusStep[] = order ? standardStepsDef.map((def) => {
        const matchedHistory = sortedHistory.find(def.match);
        if (matchedHistory) {
            const hDateTime = formatOrderDateTime(matchedHistory.createdAt || '');
            return {
                label: def.label,
                date: hDateTime.date,
                time: hDateTime.time,
                isCompleted: true,
            };
        } else {
            return {
                label: def.label,
                date: '',
                time: '',
                isCompleted: false,
            };
        }
    }) : [];

    // Determine the current step index: the last completed step
    let lastCompletedIndex = -1;
    for (let i = 0; i < statusSteps.length; i++) {
        if (statusSteps[i].isCompleted) {
            lastCompletedIndex = i;
        }
    }
    // Auto-complete all previous steps up to the current progress point
    if (lastCompletedIndex !== -1) {
        for (let i = 0; i <= lastCompletedIndex; i++) {
            statusSteps[i].isCompleted = true;
        }
        statusSteps[lastCompletedIndex].isCurrent = true;
    }

    const statusNameLower = (order?.status?.name || '').toLowerCase();
    const canLeaveReview = order ? (order.status?.id === '2'
        || statusNameLower.includes('завершено')
        || statusNameLower.includes('виконано')
        || statusNameLower.includes('выполнено')
        || statusNameLower.includes('доставлено')
        || statusNameLower.includes('delivered')
        || statusNameLower.includes('completed')) : false;

    const hasReview = !!orderReview;

    return (
        <div className={s.orderDetailsPage}>
            <PersonalContentBlock className={s.detailsBlock}>
                <PersonalPageHeader 
                    title={
                        <>
                            {dict.orderTitle} {' '}
                            <span style={{ color: '#E30613' }}>{order ? '№' + (order.orderNo || order.id) : ''}</span>
                        </>
                    }
                    logoutLabel={pDict.navigation.logout}
                    onLogout={handleLogout}
                    user={user}
                    navDict={pDict.navigation}
                />

                {loading ? (
                    <div className={s.loaderContainer}>
                        <Spinner />
                    </div>
                ) : !order ? (
                    <div className={s.emptyState}>
                        {lang === 'ru' ? 'Заказ не найден.' : 'Замовлення не знайдено.'}
                    </div>
                ) : (
                    <>
                        <div className={s.metaRow}>
                            <div className={s.metaItem}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none">
                                    <path d="M9.35 1.1H8.25V0.55C8.25 0.404131 8.19205 0.264236 8.08891 0.161091C7.98576 0.0579462 7.84587 0 7.7 0C7.55413 0 7.41424 0.0579462 7.31109 0.161091C7.20795 0.264236 7.15 0.404131 7.15 0.55V1.1H3.85V0.55C3.85 0.404131 3.79205 0.264236 3.68891 0.161091C3.58576 0.0579462 3.44587 0 3.3 0C3.15413 0 3.01424 0.0579462 2.91109 0.161091C2.80795 0.264236 2.75 0.404131 2.75 0.55V1.1H1.65C1.21239 1.1 0.792709 1.27384 0.483274 1.58327C0.173839 1.89271 0 2.31239 0 2.75V9.35C0 9.78761 0.173839 10.2073 0.483274 10.5167C0.792709 10.8262 1.21239 11 1.65 11H9.35C9.78761 11 10.2073 10.8262 10.5167 10.5167C10.8262 10.2073 11 9.78761 11 9.35V2.75C11 2.31239 10.8262 1.89271 10.5167 1.58327C10.2073 1.27384 9.78761 1.1 9.35 1.1ZM9.9 9.35C9.9 9.49587 9.84205 9.63576 9.73891 9.73891C9.63576 9.84205 9.49587 9.9 9.35 9.9H1.65C1.50413 9.9 1.36424 9.84205 1.26109 9.73891C1.15795 9.63576 1.1 9.49587 1.1 9.35V5.5H9.9V9.35ZM9.9 4.4H1.1V2.75C1.1 2.60413 1.15795 2.46424 1.26109 2.36109C1.36424 2.25795 1.50413 2.2 1.65 2.2H2.75V2.75C2.75 2.89587 2.80795 3.03576 2.91109 3.13891C3.01424 3.24205 3.15413 3.3 3.3 3.3C3.44587 3.3 3.58576 3.24205 3.68891 3.13891C3.79205 3.03576 3.85 2.89587 3.85 2.75V2.2H7.15V2.75C7.15 2.89587 7.20795 3.03576 7.31109 3.13891C7.41424 3.24205 7.55413 3.3 7.7 3.3C7.84587 3.3 7.98576 3.24205 8.08891 3.13891C8.19205 3.03576 8.25 2.89587 8.25 2.75V2.2H9.35C9.49587 2.2 9.63576 2.25795 9.73891 2.36109C9.84205 2.46424 9.9 2.60413 9.9 2.75V4.4Z" fill="black"/>
                                </svg>
                                <span>{date}</span>
                            </div>
                            <div className={s.metaItem}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M7.5 2.1875C4.57063 2.1875 2.1875 4.57063 2.1875 7.5C2.1875 10.4294 4.57063 12.8125 7.5 12.8125C10.4294 12.8125 12.8125 10.4294 12.8125 7.5C12.8125 4.57063 10.4294 2.1875 7.5 2.1875ZM7.5 13.75C4.05375 13.75 1.25 10.9463 1.25 7.5C1.25 4.05375 4.05375 1.25 7.5 1.25C10.9463 1.25 13.75 4.05375 13.75 7.5C13.75 10.9463 10.9463 13.75 7.5 13.75Z" fill="black"/>
                                    <path fillRule="evenodd" clipRule="evenodd" d="M9.64531 9.8077C9.56344 9.8077 9.48094 9.78645 9.40531 9.74207L7.04906 8.33645C6.90781 8.25145 6.82031 8.09832 6.82031 7.93332V4.90332C6.82031 4.64457 7.03031 4.43457 7.28906 4.43457C7.54844 4.43457 7.75781 4.64457 7.75781 4.90332V7.66707L9.88594 8.93582C10.1078 9.06895 10.1809 9.35645 10.0484 9.57895C9.96031 9.72582 9.80469 9.8077 9.64531 9.8077Z" fill="black"/>
                                </svg>
                                <span>{time}</span>
                            </div>
                            <div className={s.sourceItem}>
                                {dict.sourcePrefix} <strong>{order.source === 'app' ? dict.sourceApp : dict.sourceSite}</strong>
                            </div>
                        </div>

                        <div className={s.section}>
                            <h2 className={s.sectionTitle}>{dict.productsHeading}</h2>
                            <div className={s.productsGrid}>
                                {(order.items || []).map((product, index) => {
                                    const resolvedImg = resolveOrderItemImageUrl(product.id, product.image, productDetailsMap);
                                    const dbProduct = productDetailsMap[Number(product.id)];
                                    const slug = dbProduct?.slug;

                                    // Calculate summed price
                                    const modifiersList = product.modifiers || [];
                                    const modifiersPrice = modifiersList.reduce((sum, m) => sum + (m.price || 0), 0);
                                    const finalPrice = product.cost + modifiersPrice;

                                    // Resolve image/icon for each modifier
                                    const renderedModifiers = modifiersList.map((m) => {
                                        let modifierImage: string | null = null;
                                        if (dbProduct?.modifierGroups) {
                                            for (const group of dbProduct.modifierGroups) {
                                                const found = group.modifiers?.find((mod) => Number(mod.id) === Number(m.id));
                                                if (found && found.image) {
                                                    const rawUrl = found.image.icon3x || found.image.icon2x || found.image.icon1x;
                                                    if (rawUrl) {
                                                        modifierImage = rawUrl.startsWith('/') 
                                                            ? `https://dev-api.myastoriya.com.ua${rawUrl}` 
                                                            : rawUrl;
                                                    }
                                                }
                                            }
                                        }
                                        const iconUrl = modifierImage || getModifierIconUrl(m.name);
                                        return {
                                            ...m,
                                            iconUrl,
                                        };
                                    });

                                    return (
                                        <ProductCard 
                                            key={`${product.id}-${index}`}
                                            id={product.id}
                                            slug={slug}
                                            title={product.name}
                                            weight={product.totalWeight || (lang === 'ru' ? '1 шт.' : '1 шт.')}
                                            price={finalPrice}
                                            unit={product.unit || (lang === 'ru' ? 'шт.' : 'шт.')}
                                            image={resolvedImg}
                                            badge={null}
                                            lang={lang}
                                        >
                                            {renderedModifiers.length > 0 && (
                                                <div className={s.modifierIconsList}>
                                                    {renderedModifiers.map((m, mIdx) => (
                                                        <div 
                                                            key={`${m.id}-${mIdx}`} 
                                                            className={s.modifierIconWrapper} 
                                                            title={m.name || undefined}
                                                        >
                                                            {m.iconUrl ? (
                                                                <Image
                                                                    src={m.iconUrl}
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
                                                    ))}
                                                </div>
                                            )}
                                        </ProductCard>
                                    );
                                })}
                            </div>
                        </div>

                        <div className={s.summaryGrid}>
                            {order.personsCount !== null && order.personsCount !== undefined && order.personsCount > 0 && (
                                <div className={s.summaryItem}>
                                    <span className={s.summaryLabel}>{dict.summary.persons}</span>
                                    <span className={s.summaryValue}>{order.personsCount} <strong>{dict.summary.unit}</strong></span>
                                </div>
                            )}
                            {order.calculation?.map((calc, index) => {
                                const isNegative = calc.amount < 0;
                                return (
                                    <div key={index} className={s.summaryItem}>
                                        <span className={s.summaryLabel}>{calc.name?.replace(/:$/, '')}</span>
                                        <span className={clsx(s.summaryValue, isNegative && s.negative)}>
                                            {calc.amount === 0 
                                                ? (lang === 'ru' ? 'Бесплатно' : 'Безкоштовно') 
                                                : `${calc.amount.toLocaleString('uk-UA')} ₴`}
                                        </span>
                                    </div>
                                );
                            })}
                            <div className={s.summaryItem}>
                                <span className={s.summaryLabel}>{dict.summary.total}</span>
                                <span className={s.summaryValue}>{order.total.toLocaleString("uk-UA")} <strong>₴</strong></span>
                            </div>
                        </div>

                        <div className={s.detailsGrid}>
                            <div className={s.statusCol}>
                                <h2 className={s.sectionTitle}>{dict.statusHeading}</h2>
                                {statusSteps.length > 0 ? (
                                    <OrderStatusTimeline steps={statusSteps} />
                                ) : (
                                    <p className={s.infoText}>
                                        {lang === 'ru' ? 'Статус отсутствует.' : 'Статус відсутній.'}
                                    </p>
                                )}
                            </div>
                            
                            <div className={s.infoCol}>
                                <div className={s.deliveryInfoRow}>
                                    {order.delivery?.time && (
                                        <div className={s.infoBlock}>
                                            <h2 className={s.sectionTitle}>{dict.deliveryTime}</h2>
                                            <p className={s.infoText}>{order.delivery.time}</p>
                                        </div>
                                    )}
                                    
                                    {order.delivery?.service && (
                                        <div className={s.infoBlock}>
                                            <h2 className={s.sectionTitle}>{dict.deliveryType}</h2>
                                            <p className={s.infoText}>{order.delivery.service}</p>
                                        </div>
                                    )}
                                </div>

                                {order.comment && (
                                    <div className={s.infoBlock}>
                                        <h2 className={s.sectionTitle}>{dict.commentHeading}</h2>
                                        <p className={s.infoText}>{order.comment}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={s.actionsContainer}>
                            {canLeaveReview && (
                                <button className={s.reviewLink} onClick={handleLeaveReview}>
                                    {hasReview ? dict.editReviewBtn : dict.reviewBtn}
                                </button>
                            )}
                            <Button variant="red" className={s.repeatBtn} onClick={handleRepeatOrder}>
                                {dict.repeatBtn}
                            </Button>
                        </div>
                    </>
                )}
            </PersonalContentBlock>

            {isModalOpen && order && (
                <PersonalReviewModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    orderNumber={order.id}
                    initialData={
                        orderReview
                            ? {
                                  review: orderReview.text,
                                  ratings: {
                                      personnel: orderReview.ratings?.find(r => r.id === '1')?.rating || 3,
                                      service: orderReview.ratings?.find(r => r.id === '2')?.rating || 3,
                                      delivery: orderReview.ratings?.find(r => r.id === '4')?.rating || 3,
                                      product: orderReview.ratings?.find(r => r.id === '5')?.rating || 3,
                                  }
                              }
                            : undefined
                    }
                    onSuccess={loadData}
                />
            )}
        </div>
    );
}
