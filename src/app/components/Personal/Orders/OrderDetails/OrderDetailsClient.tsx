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
import ProductCard from '@/app/components/ui/ProductCard/ProductCard';
import OrderStatusTimeline, { StatusStep } from '../OrderStatusTimeline/OrderStatusTimeline';
import Button from '@/app/components/ui/Button/Button';
import AppLink from '@/app/components/ui/AppLink/AppLink';
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
import s from './OrderDetailsClient.module.scss';

const detailsDict = {
    ua: {
        orderTitle: "ЗАМОВЛЕННЯ №",
        backToHistory: "Історія замовлень",
        sourcePrefix: "Замовлення:",
        sourceValue: "з сайту",
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
        sourceValue: "с сайта",
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
    productDetailsMap?: Record<number, { image: string; slug?: string; name: string }>
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
    const [productDetailsMap, setProductDetailsMap] = useState<Record<number, { image: string; slug?: string; name: string }>>({});
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

            const detailsMap: Record<number, { image: string; slug?: string; name: string }> = {};
            if (productIds.length > 0) {
                try {
                    const details = await getProductsByIdsApi(productIds, lang);
                    details.forEach(prod => {
                        detailsMap[Number(prod.id)] = {
                            image: resolveProductImageUrl(prod),
                            slug: prod.slug,
                            name: prod.name,
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

    if (loading) {
        return (
            <div className={s.loaderContainer}>
                <Spinner />
            </div>
        );
    }

    if (!order) {
        return (
            <div className={s.emptyState}>
                {lang === 'ru' ? 'Заказ не найден.' : 'Замовлення не знайдено.'}
            </div>
        );
    }

    const { date, time } = formatOrderDateTime(order.createdAt);
    
    // Sort statusHistory by date ascending
    const history = (order.statusHistory || []).filter((h): h is OrderStatus => h !== null);
    const sortedHistory = [...history].sort((a, b) => 
        new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
    );

    // Standard steps configuration
    const standardStepsDef = [
        { key: 'new', label: lang === 'ru' ? 'Новое заказ' : 'Нове замовлення', match: (h: OrderStatus) => h.id === '1' || (h.name || '').toLowerCase().includes('нов') },
        { key: 'preparing', label: lang === 'ru' ? 'Готовится' : 'Готується', match: (h: OrderStatus) => h.id === '4' || (h.name || '').toLowerCase().includes('готу') || (h.name || '').toLowerCase().includes('прийнят') },
        { key: 'courier', label: order.delivery?.service?.toLowerCase().includes('самовивіз') || order.delivery?.service?.toLowerCase().includes('самовывоз') 
            ? (lang === 'ru' ? 'Готово к выдаче' : 'Готово до видачі')
            : (lang === 'ru' ? 'Выдано курьеру' : 'Видано кур’єру'), 
          match: (h: OrderStatus) => h.id === '5' || (h.name || '').toLowerCase().includes('кур') || (h.name || '').toLowerCase().includes('відправл') },
        { key: 'delivered', label: lang === 'ru' ? 'Доставлено' : 'Доставлено', match: (h: OrderStatus) => h.id === '6' || (h.name || '').toLowerCase().includes('достав') },
        { key: 'completed', label: lang === 'ru' ? 'Завершено' : 'Завершено', match: (h: OrderStatus) => h.id === '2' || (h.name || '').toLowerCase().includes('викон') || (h.name || '').toLowerCase().includes('заверш') }
    ];

    // Map history to standard steps
    const statusSteps: StatusStep[] = standardStepsDef.map((def) => {
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
    });

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

    const statusNameLower = (order.status?.name || '').toLowerCase();
    const canLeaveReview = order.status?.id === '2'
        || statusNameLower.includes('завершено')
        || statusNameLower.includes('виконано')
        || statusNameLower.includes('выполнено')
        || statusNameLower.includes('доставлено')
        || statusNameLower.includes('delivered')
        || statusNameLower.includes('completed');

    const hasReview = !!orderReview;

    return (
        <div className={s.orderDetailsPage}>
            <PersonalContentBlock className={s.detailsBlock}>
                <PersonalPageHeader 
                    title={
                        <>
                            {dict.orderTitle}
                            <span style={{ color: '#E30613' }}>{order.orderNo || order.id}</span>
                        </>
                    }
                    logoutLabel={pDict.navigation.logout}
                    onLogout={handleLogout}
                    user={user}
                    navDict={pDict.navigation}
                />

                <div className={s.metaRow}>
                    <div className={s.metaItem}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.25 1.75H11.375V0.875H10.5V1.75H3.5V0.875H2.625V1.75H1.75C1.26875 1.75 0.875 2.14375 0.875 2.625V12.25C0.875 12.7313 1.26875 13.125 1.75 13.125H12.25C12.7313 13.125 13.125 12.7313 13.125 12.25V2.625C13.125 2.14375 12.7313 1.75 12.25 1.75ZM12.25 12.25H1.75V4.375H12.25V12.25Z" fill="#1C1B1B"/>
                        </svg>
                        <span>{date}</span>
                    </div>
                    <div className={s.metaItem}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7 0C3.13437 0 0 3.13437 0 7C0 10.8656 3.13437 14 7 14C10.8656 14 14 10.8656 14 7C14 3.13437 10.8656 0 7 0ZM7 12.6875C3.86563 12.6875 1.3125 10.1344 1.3125 7C1.3125 3.86563 3.86563 1.3125 7 1.3125C10.1344 1.3125 12.6875 3.86563 12.6875 7C12.6875 10.1344 10.1344 12.6875 7 12.6875ZM7.4375 3.5H6.125V7.4375L9.625 9.5375L10.2812 8.46562L7.4375 6.78125V3.5Z" fill="#1C1B1B"/>
                        </svg>
                        <span>{time}</span>
                    </div>
                    <div className={s.sourceItem}>
                        {dict.sourcePrefix} <strong>{dict.sourceValue}</strong>
                    </div>
                </div>

                <div className={s.section}>
                    <h2 className={s.sectionTitle}>{dict.productsHeading}</h2>
                    <div className={s.productsGrid}>
                        {(order.items || []).map((product) => {
                            const resolvedImg = resolveOrderItemImageUrl(product.id, product.image, productDetailsMap);
                            const slug = productDetailsMap[Number(product.id)]?.slug;
                            return (
                                <ProductCard 
                                    key={product.id}
                                    id={product.id}
                                    slug={slug}
                                    title={product.name}
                                    weight={product.totalWeight || (lang === 'ru' ? '1 шт.' : '1 шт.')}
                                    price={product.cost}
                                    unit={product.unit || (lang === 'ru' ? 'шт.' : 'шт.')}
                                    image={resolvedImg}
                                    badge={null}
                                    lang={lang}
                                />
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
            </PersonalContentBlock>

            {isModalOpen && (
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
