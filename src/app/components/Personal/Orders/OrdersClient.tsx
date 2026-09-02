'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import DatePicker from '@/app/components/ui/DatePicker/DatePicker';
import { startOfDay, endOfDay } from 'date-fns';
import OrderCard from './OrderCard/OrderCard';
import s from './OrdersClient.module.scss';
import Spinner from '@/app/components/ui/Spinner/Spinner';
import PersonalReviewModal from '@/app/components/Personal/Reviews/PersonalReviewModal/PersonalReviewModal';
import { addToCartAsync, fetchCartAsync, setCartModalOpen } from '@/store/slices/cartSlice';
import UnavailableProductsModal, { UnavailableProduct } from './UnavailableProductsModal/UnavailableProductsModal';
import * as Sentry from '@sentry/nextjs';

import {
    getOrdersApi,
    getProductsByIdsApi,
    resolveProductImageUrl,
    getOrderReviewsApi,
    Order,
    OrderReview
} from '@/lib/graphql';

const ordersDict = {
    ua: {
        title: "ІСТОРІЯ ЗАМОВЛЕНЬ",
        sortLabel: "По даті",
        sortPrefix: "Сортування: ",
        noOrders: "У вас ще немає замовлень.",
        noOrdersFilter: "У вас немає замовлень у вибрані дати.",
        card: {
            orderPrefix: "Замовлення",
            sourcePrefix: "Замовлення",
            sourceSite: "з сайту",
            sourceApp: "з додатку",
            sumLabel: "Сума замовлення",
            reviewLink: "Залишити відгук",
            editReviewLink: "Змінити відгук",
            repeatBtn: "ПОВТОРИТИ ЗАМОВЛЕННЯ",
            detailsBtn: "ДЕТАЛІ ЗАМОВЛЕННЯ",
        }
    },
    ru: {
        title: "ИСТОРИЯ ЗАКАЗОВ",
        sortLabel: "По дате",
        sortPrefix: "Сортировка: ",
        noOrders: "У вас еще нет заказов.",
        noOrdersFilter: "У вас нет заказов в выбранные даты.",
        card: {
            orderPrefix: "Заказ",
            sourcePrefix: "Заказ",
            sourceSite: "с сайта",
            sourceApp: "из приложения",
            sumLabel: "Сумма заказа",
            reviewLink: "Оставить отзыв",
            editReviewLink: "Изменить отзыв",
            repeatBtn: "ПОВТОРИТЬ ЗАКАЗ",
            detailsBtn: "ДЕТАЛИ ЗАКАЗА",
        }
    }
};

interface ProductDetails {
    image: string;
    slug?: string;
    name: string;
    categoryId?: number | string | null;
}

const resolveOrderItemImageUrl = (
    itemId: string,
    image?: {
        list1x?: string | null;
        grid1x?: string | null;
        main1x?: string | null;
    } | null,
    productDetailsMap?: Record<number, ProductDetails>
): string => {
    const url = image?.list1x || image?.grid1x || image?.main1x || null;
    if (url) {
        if (url.startsWith('/images/')) return url;
        if (url.startsWith('/')) return `https://dev-api.myastoriya.com.ua${url}`;
        return url;
    }

    const productId = Number(itemId);
    if (productId && productDetailsMap?.[productId]) {
        return productDetailsMap[productId].image;
    }

    return '/images/product-placeholder.svg';
};

const getStatusVariant = (statusId?: string | null, statusName?: string | null): 'success' | 'warning' | 'error' => {
    if (!statusId && !statusName) return 'warning';
    
    const id = statusId?.toString();
    const name = statusName?.toLowerCase() || '';

    // Error / Cancelled statuses
    if (id === '3' || name.includes('скасовано') || name.includes('отменено') || name.includes('cancelled')) {
        return 'error';
    }

    // Success / Completed / Delivered statuses
    if (id === '2' || name.includes('виконано') || name.includes('выполнено') || name.includes('доставлено') || name.includes('completed') || name.includes('delivered')) {
        return 'success';
    }

    // Warning / In progress / Unpaid statuses
    return 'warning';
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

interface OrdersClientProps {
    lang: Locale;
}

export default function OrdersClient({ lang }: OrdersClientProps) {
    const hydrated = useIsHydrated();
    const dict = ordersDict[lang] || ordersDict.ua;
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { user } = useAppSelector((state) => state.auth);

    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    const isDateInRange = (dateToCheck: Date, start: Date | null, end: Date | null) => {
        if (!start) return true;
        const checkTime = startOfDay(dateToCheck).getTime();
        const startTime = startOfDay(start).getTime();
        if (!end) {
            return checkTime === startTime;
        }
        const endTime = endOfDay(end).getTime();
        return checkTime >= startTime && checkTime <= endTime;
    };

    const handleDateChange = (dates: [Date | null, Date | null]) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
    };

    const handleClearDate = (e: React.SyntheticEvent) => {
        e.stopPropagation();
        setStartDate(null);
        setEndDate(null);
    };
    const [orders, setOrders] = useState<Order[]>([]);
    const [orderReviews, setOrderReviews] = useState<Record<string, OrderReview>>({});
    const [productDetailsMap, setProductDetailsMap] = useState<Record<number, ProductDetails>>({});
    const [loading, setLoading] = useState(false);

    // Review modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<{ id: string; ratings?: Record<string, number>; review?: string } | null>(null);

    // Unavailable products modal state
    const [unavailableProducts, setUnavailableProducts] = useState<UnavailableProduct[]>([]);
    const [isUnavailableModalOpen, setIsUnavailableModalOpen] = useState(false);
    // Whether to open cart after closing unavailable modal
    const [openCartAfterUnavailable, setOpenCartAfterUnavailable] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const token = await getAccessToken();
            if (!token) return;

            // 1. Fetch Orders
            const ordersData = await getOrdersApi(token, { limit: 100 }, lang);
            setOrders(ordersData.data);

            // 2. Fetch product details to get correct image URLs
            const productIds = Array.from(new Set(
                ordersData.data
                    .flatMap(order => order.items || [])
                    .map(item => Number(item.id))
                    .filter(id => !isNaN(id) && id > 0)
            ));

            const detailsMap: Record<number, ProductDetails> = {};
            if (productIds.length > 0) {
                try {
                    const details = await getProductsByIdsApi(productIds, lang);
                    details.forEach(prod => {
                        detailsMap[Number(prod.id)] = {
                            image: resolveProductImageUrl(prod),
                            slug: prod.slug,
                            name: prod.name,
                            categoryId: prod.categoryId,
                        };
                    });
                } catch (e) {
                    console.error("Failed to fetch product details for images:", e);
                }
            }
            setProductDetailsMap(detailsMap);

            // 3. Fetch Order Reviews
            const orderReviewsData = await getOrderReviewsApi(token, { limit: 100 }, lang);
            const oRevMap: Record<string, OrderReview> = {};
            orderReviewsData.data.forEach((r) => {
                oRevMap[r.orderId.toString()] = r;
            });
            setOrderReviews(oRevMap);

            // 4. Auto-prompt review modal once if there's a completed order without a review
            const userId = user?.id || 'current';
            const storageKey = `order_review_auto_prompt_shown_${userId}`;
            const hasBeenPrompted = sessionStorage.getItem(storageKey) || localStorage.getItem(storageKey);

            if (!hasBeenPrompted) {
                // Filter completed orders without review
                const completedUnreviewedOrders = ordersData.data.filter(order => {
                    const statusNameLower = (order.status?.name || '').toLowerCase();
                    const isCompleted = order.status?.id === '2'
                        || statusNameLower.includes('завершено')
                        || statusNameLower.includes('виконано')
                        || statusNameLower.includes('выполнено')
                        || statusNameLower.includes('доставлено')
                        || statusNameLower.includes('delivered')
                        || statusNameLower.includes('completed');

                    const hasReview = !!oRevMap[order.id.toString()] || (order.orderNo ? !!oRevMap[order.orderNo.toString()] : false);
                    return isCompleted && !hasReview;
                });

                if (completedUnreviewedOrders.length > 0) {
                    // Pick the latest (most recent) order by createdAt date
                    const latestOrder = completedUnreviewedOrders.reduce((latest, current) => {
                        const latestDate = new Date(latest.createdAt).getTime();
                        const currentDate = new Date(current.createdAt).getTime();
                        return currentDate > latestDate ? current : latest;
                    }, completedUnreviewedOrders[0]);

                    sessionStorage.setItem(storageKey, 'true');
                    setSelectedOrder({ id: latestOrder.id.toString() });
                    setIsModalOpen(true);
                }
            }
        } catch (error) {
            console.error('Error fetching orders details:', error);
        } finally {
            setLoading(false);
        }
    }, [lang, user]);

    useEffect(() => {
        if (hydrated && user) {
            loadData();
        }
    }, [hydrated, user, loadData]);

    const { token: storeToken } = useAppSelector((state) => state.auth);

    const handleLogout = async () => {
        try {
            if (user?.id) {
                const storageKey = `order_review_auto_prompt_shown_${user.id}`;
                localStorage.removeItem(storageKey);
                sessionStorage.removeItem(storageKey);
            }
            const token = storeToken || await getAccessToken();
            if (token) await logoutApi(token);
        } catch {
            // Ignore
        } finally {
            await clearAuthCookies();
            dispatch(logout());
            window.location.href = lang === 'ua' ? '/' : `/${lang}`;
        }
    };

    const handleRepeatOrder = async (order: Order) => {
        try {
            const items = order.items;
            if (!items || items.length === 0) return;

            const results = await Promise.allSettled(
                items.map((item) =>
                    dispatch(addToCartAsync({
                        id: item.id,
                        quantity: item.quantity,
                    })).unwrap()
                )
            );

            const failed: UnavailableProduct[] = [];
            results.forEach((result, idx) => {
                if (result.status === 'rejected') {
                    const item = items[idx];
                    failed.push({
                        id: item.id,
                        name: item.name,
                        quantity: item.quantity,
                    });
                }
            });

            // Refresh cart from backend to sync items cleanly
            await dispatch(fetchCartAsync());

            const hasAdded = failed.length < items.length;

            if (failed.length > 0) {
                setUnavailableProducts(failed);
                setOpenCartAfterUnavailable(hasAdded);
                setIsUnavailableModalOpen(true);
            } else {
                dispatch(setCartModalOpen(true));
            }
        } catch (error) {
            console.error('Failed to repeat order:', error);
            Sentry.captureException(error, {
                tags: { category: 'cart', action: 'repeat_order_list' },
                extra: { orderId: order.id, orderNo: order.orderNo },
            });
            void dispatch(fetchCartAsync());
        }
    };

    const handleCloseUnavailableModal = () => {
        setIsUnavailableModalOpen(false);
        if (openCartAfterUnavailable) {
            dispatch(setCartModalOpen(true));
        } else {
            void dispatch(fetchCartAsync());
        }
        setUnavailableProducts([]);
        setOpenCartAfterUnavailable(false);
    };

    const handleLeaveReview = (orderId: string) => {
        setSelectedOrder({ id: orderId });
        setIsModalOpen(true);
    };

    const handleEditReview = (orderId: string, reviewText?: string, ratings?: { id: string; rating: number }[]) => {
        const catsMap: Record<string, number> = {};
        ratings?.forEach((item) => {
            if (item.id === '1') catsMap.personnel = item.rating;
            if (item.id === '2') catsMap.service = item.rating;
            if (item.id === '4') catsMap.delivery = item.rating;
            if (item.id === '5') catsMap.product = item.rating;
        });
        setSelectedOrder({
            id: orderId,
            review: reviewText,
            ratings: catsMap,
        });
        setIsModalOpen(true);
    };

    if (!hydrated) {
        return null;
    }

    const filteredOrders = orders
        .filter((order) => isDateInRange(new Date(order.createdAt), startDate, endDate));

    const sortedOrders = [...filteredOrders].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return (
        <div className={s.ordersPage}>
            <PersonalContentBlock className={s.ordersBlock}>
                <PersonalPageHeader 
                    title={dict.title}
                    logoutLabel={personalDict[lang].navigation.logout}
                    onLogout={handleLogout}
                    user={user}
                    navDict={personalDict[lang].navigation}
                />
                {orders.length > 0 && (
                    <div className={s.controlsRow}>
                        <DatePicker
                            id="orders-date-range"
                            label={dict.sortLabel}
                            prefixLabel={dict.sortPrefix}
                            hideLabel={true}
                            hideIcon={true}
                            selectsRange={true}
                            startDate={startDate}
                            endDate={endDate}
                            onChangeRange={handleDateChange}
                            onClear={handleClearDate}
                            maxDate={new Date()}
                            className={s.ordersDatePicker}
                            lang={lang}
                        />
                    </div>
                )}

                {loading && orders.length === 0 ? (
                    <div className={s.loaderContainer}>
                        <Spinner />
                    </div>
                ) : sortedOrders.length === 0 ? (
                    <div className={s.emptyState}>
                        {orders.length === 0 ? dict.noOrders : dict.noOrdersFilter}
                    </div>
                ) : (
                    <div className={s.ordersList}>
                        {sortedOrders.map((order) => {
                            const { date, time } = formatOrderDateTime(order.createdAt);
                            const totalProductsCount = order.items?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0;
                            const orderSum = order.total;

                            const calculationDiscount = (order.calculation || []).reduce((acc, c) => {
                                const name = (c.name || '').toLowerCase();
                                if (c.amount < 0 && (name.includes('знижк') || name.includes('скидк') || name.includes('discount') || name.includes('промо') || name.includes('promo'))) {
                                    return acc + Math.abs(c.amount);
                                }
                                return acc;
                            }, 0);

                            const itemLevelDiscount = (order.items || []).reduce((acc, item) => {
                                if (item.totalOldCost && item.totalOldCost > item.totalCost) {
                                    return acc + (item.totalOldCost - item.totalCost);
                                }
                                return acc;
                            }, 0);

                            const totalDiscount = Math.max(calculationDiscount, itemLevelDiscount);
                            const oldSum = totalDiscount > 0 ? orderSum + totalDiscount : undefined;

                            const orderProducts = order.items?.map((item) => {
                                const dbProduct = productDetailsMap[Number(item.id)];
                                return {
                                    id: item.id,
                                    image: resolveOrderItemImageUrl(item.id, item.image, productDetailsMap),
                                    slug: dbProduct?.slug,
                                    categoryId: dbProduct?.categoryId,
                                    name: item.name || dbProduct?.name,
                                };
                            }) || [];

                            const statusName = order.status?.name || (lang === 'ru' ? 'Новый заказ' : 'Нове замовлення');
                            const statusVariant = getStatusVariant(order.status?.id, order.status?.name);

                            const review = orderReviews[order.id.toString()] || (order.orderNo ? orderReviews[order.orderNo.toString()] : undefined);
                            const hasReview = !!review;

                            const statusNameLower = (order.status?.name || '').toLowerCase();
                            const canLeaveReview = order.status?.id === '2'
                                || statusNameLower.includes('завершено')
                                || statusNameLower.includes('виконано')
                                || statusNameLower.includes('выполнено')
                                || statusNameLower.includes('доставлено')
                                || statusNameLower.includes('delivered')
                                || statusNameLower.includes('completed');

                            return (
                                <OrderCard
                                    key={order.id}
                                    orderNumber={order.orderNo || order.id}
                                    status={statusName}
                                    statusVariant={statusVariant}
                                    source={order.source === 'app' ? dict.card.sourceApp : dict.card.sourceSite}
                                    products={orderProducts}
                                    totalProductsCount={totalProductsCount}
                                    sum={orderSum}
                                    oldSum={oldSum}
                                    date={date}
                                    time={time}
                                    dict={dict.card}
                                    onRepeatOrder={() => handleRepeatOrder(order)}
                                    onDetails={() => router.push(`/${lang}/personal/orders/${order.id}`)}
                                    onReview={
                                        canLeaveReview
                                            ? hasReview
                                                ? () => handleEditReview(order.id, review.text, review.ratings || [])
                                                : () => handleLeaveReview(order.id)
                                            : undefined
                                    }
                                    reviewLabel={
                                        hasReview ? dict.card.editReviewLink : dict.card.reviewLink
                                    }
                                />
                            );
                        })}
                    </div>
                )}
            </PersonalContentBlock>

            {selectedOrder && (
                <PersonalReviewModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedOrder(null);
                    }}
                    orderNumber={selectedOrder.id}
                    initialData={
                        selectedOrder.review
                            ? {
                                  review: selectedOrder.review,
                                  ratings: selectedOrder.ratings,
                              }
                            : undefined
                    }
                    onSuccess={loadData}
                />
            )}

            <UnavailableProductsModal
                isOpen={isUnavailableModalOpen}
                onClose={handleCloseUnavailableModal}
                products={unavailableProducts}
                lang={lang}
            />
        </div>
    );
}
