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
import SortSelect from '@/app/components/ui/SortSelect/SortSelect';
import OrderCard from './OrderCard/OrderCard';
import s from './OrdersClient.module.scss';
import Spinner from '@/app/components/ui/Spinner/Spinner';
import PersonalReviewModal from '@/app/components/Personal/Reviews/PersonalReviewModal/PersonalReviewModal';
import { fetchCartAsync } from '@/store/slices/cartSlice';

import {
    getOrdersApi,
    repeatOrderApi,
    getProductsByIdsApi,
    resolveProductImageUrl,
    getOrderReviewsApi,
    Order,
    OrderReview
} from '@/lib/graphql';

const ordersDict = {
    ua: {
        title: "ІСТОРІЯ ЗАМОВЛЕНЬ",
        sortLabel: "Сортування:",
        sortOptions: ["По даті", "За сумою"],
        card: {
            orderPrefix: "Замовлення",
            sourcePrefix: "Замовлення",
            sumLabel: "Сума замовлення",
            reviewLink: "Залишити відгук",
            editReviewLink: "Змінити відгук",
            repeatBtn: "ПОВТОРИТИ ЗАМОВЛЕННЯ",
            detailsBtn: "ДЕТАЛІ ЗАМОВЛЕННЯ",
        }
    },
    ru: {
        title: "ИСТОРИЯ ЗАКАЗОВ",
        sortLabel: "Сортировка:",
        sortOptions: ["По дате", "По сумме"],
        card: {
            orderPrefix: "Заказ",
            sourcePrefix: "Заказ",
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

    const [sortValue, setSortValue] = useState(dict.sortOptions[0]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [orderReviews, setOrderReviews] = useState<Record<string, OrderReview>>({});
    const [productDetailsMap, setProductDetailsMap] = useState<Record<number, ProductDetails>>({});
    const [loading, setLoading] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<{ id: string; ratings?: Record<string, number>; review?: string } | null>(null);

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
        } catch (error) {
            console.error('Error fetching orders details:', error);
        } finally {
            setLoading(false);
        }
    }, [lang]);

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

    const handleRepeatOrder = async (orderId: string) => {
        try {
            const token = await getAccessToken();
            if (!token) return;
            const success = await repeatOrderApi(orderId, token, lang);
            if (success) {
                await dispatch(fetchCartAsync()).unwrap();
            }
        } catch (error) {
            console.error('Failed to repeat order:', error);
        }
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

    const sortedOrders = [...orders].sort((a, b) => {
        if (sortValue === dict.sortOptions[0]) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else {
            return b.total - a.total;
        }
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
                <div className={s.controlsRow}>
                    <SortSelect
                        value={sortValue}
                        options={dict.sortOptions}
                        onChange={setSortValue}
                        label={dict.sortLabel}
                        className={s.sortSelect}
                    />
                </div>

                {loading && orders.length === 0 ? (
                    <div className={s.loaderContainer}>
                        <Spinner />
                    </div>
                ) : sortedOrders.length === 0 ? (
                    <div className={s.emptyState}>
                        {lang === 'ru' ? 'У вас еще нет заказов.' : 'У вас ще немає замовлень.'}
                    </div>
                ) : (
                    <div className={s.ordersList}>
                        {sortedOrders.map((order) => {
                            const { date, time } = formatOrderDateTime(order.createdAt);
                            const totalProductsCount = order.items?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0;
                            const orderSum = order.total;
                            const orderOldSum = order.items?.reduce((acc, item) => acc + (item.totalOldCost || item.totalCost), 0) || 0;
                            const oldSum = orderOldSum > orderSum ? orderOldSum : undefined;

                            const orderImages = order.items?.map((item) =>
                                resolveOrderItemImageUrl(item.id, item.image, productDetailsMap)
                            ) || [];

                            const statusName = order.status?.name || (lang === 'ru' ? 'Новый заказ' : 'Нове замовлення');
                            const statusVariant = getStatusVariant(order.status?.id, order.status?.name);

                            const review = orderReviews[order.id.toString()];
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
                                    source="з сайту"
                                    products={orderImages}
                                    totalProductsCount={totalProductsCount}
                                    sum={orderSum}
                                    oldSum={oldSum}
                                    date={date}
                                    time={time}
                                    dict={dict.card}
                                    onRepeatOrder={() => handleRepeatOrder(order.id)}
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
        </div>
    );
}
