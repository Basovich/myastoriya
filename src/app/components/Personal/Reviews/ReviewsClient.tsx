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
import ReviewCard from './ReviewCard/ReviewCard';
import ProductReviewCard from './ProductReviewCard/ProductReviewCard';
import PersonalReviewModal from './PersonalReviewModal/PersonalReviewModal';
import { getOrdersApi, getOrderReviewsApi, getProductReviewsApi, Order, OrderReview, ProductReview } from '@/lib/graphql';
import DatePicker from '@/app/components/ui/DatePicker/DatePicker';
import { startOfDay, endOfDay } from 'date-fns';
import clsx from 'clsx';
import s from './ReviewsClient.module.scss';

const reviewsDict = {
    ua: {
        title: "МОЇ ВІДГУКИ",
        tabOrders: "Відгуки по замовленню",
        tabProducts: "Відгуки про товари",
        noOrders: "У вас поки немає замовлень.",
        noProducts: "У вас поки немає придбаних товарів.",
        leaveReview: "ЗАЛИШИТИ ВІДГУК",
        editReview: "ЗМІНИТИ ВІДГУК",
        details: "ДЕТАЛІ ЗАМОВЛЕННЯ",
        filterDatePlaceholder: "Оберіть дату/діапазон",
        clearFilter: "Очистити",
        loading: "Завантаження відгуків..."
    },
    ru: {
        title: "МОИ ОТЗЫВЫ",
        tabOrders: "Отзывы по заказу",
        tabProducts: "Отзывы о товарах",
        noOrders: "У вас пока нет заказов.",
        noProducts: "У вас пока нет купленных товаров.",
        leaveReview: "ОСТАВИТЬ ОТЗЫВ",
        editReview: "ИЗМЕНИТЬ ОТЗЫВ",
        details: "ДЕТАЛИ ЗАКАЗА",
        filterDatePlaceholder: "Выберите дату/диапазон",
        clearFilter: "Очистить",
        loading: "Загрузка отзывов..."
    }
};

interface PurchasedProduct {
    id: string;
    name: string;
    image?: string | null;
    date: Date;
}

const getPurchasedProducts = (ordersList: Order[]): PurchasedProduct[] => {
    const productsMap = new Map<string, PurchasedProduct>();
    const sortedOrders = [...ordersList].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    for (const order of sortedOrders) {
        if (!order.items) continue;
        const orderDate = new Date(order.createdAt);
        for (const item of order.items) {
            if (!item.id) continue;
            if (!productsMap.has(item.id)) {
                productsMap.set(item.id, {
                    id: item.id,
                    name: item.name,
                    image: item.image?.list1x,
                    date: orderDate,
                });
            }
        }
    }
    return Array.from(productsMap.values());
};

export default function ReviewsClient({ lang }: { lang: Locale }) {
    const hydrated = useIsHydrated();
    const dict = reviewsDict[lang] || reviewsDict.ua;
    const pDict = personalDict[lang] || personalDict.ua;
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { user } = useAppSelector((state) => state.auth);

    const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    const [orders, setOrders] = useState<Order[]>([]);
    const [orderReviews, setOrderReviews] = useState<Record<string, OrderReview>>({});
    const [productReviews, setProductReviews] = useState<Record<string, ProductReview>>({});
    const [loading, setLoading] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<{ id: string; ratings?: Record<string, number>; review?: string } | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<{ id: number; name: string; rating?: number; review?: string } | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const token = await getAccessToken();
            if (!token) return;

            // 1. Fetch Orders
            const ordersData = await getOrdersApi(token, { limit: 100 });
            setOrders(ordersData.data);

            // 2. Fetch Order Reviews
            const orderReviewsData = await getOrderReviewsApi(token, { limit: 100 });
            const oRevMap: Record<string, OrderReview> = {};
            orderReviewsData.data.forEach((r) => {
                oRevMap[r.orderId.toString()] = r;
            });
            setOrderReviews(oRevMap);

            // 3. Extract unique purchased products
            const productsList = getPurchasedProducts(ordersData.data);
            const pRevMap: Record<string, ProductReview> = {};
            
            // Fetch product reviews sequentially to not overwhelm dev-api
            for (const prod of productsList) {
                try {
                    const pRevData = await getProductReviewsApi(token, {
                        productId: parseInt(prod.id),
                        userId: user?.id ? parseInt(user.id) : undefined,
                        limit: 1,
                    });
                    if (pRevData.data && pRevData.data.length > 0) {
                        pRevMap[prod.id] = pRevData.data[0];
                    }
                } catch (error) {
                    console.error(`Failed to fetch reviews for product ${prod.id}:`, error);
                }
            }
            setProductReviews(pRevMap);
        } catch (error) {
            console.error('Error fetching reviews details:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

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

    const handleClearDate = (e: React.MouseEvent) => {
        e.stopPropagation();
        setStartDate(null);
        setEndDate(null);
    };

    const openOrderReviewModal = (id: string, initialData?: { review?: string; ratings?: Record<string, number> }) => {
        setSelectedOrder({ id, ...initialData });
        setSelectedProduct(null);
        setIsModalOpen(true);
    };

    const openProductReviewModal = (id: number, name: string, initialData?: { review?: string; ratings?: number }) => {
        setSelectedProduct({ id, name, ...initialData });
        setSelectedOrder(null);
        setIsModalOpen(true);
    };

    const handleReviewSuccess = () => {
        setIsModalOpen(false);
        loadData();
    };

    if (!hydrated) {
        return null;
    }

    const productsList = getPurchasedProducts(orders);

    // Filter and Sort Orders by date (newest first)
    const filteredOrders = orders
        .filter((order) => isDateInRange(new Date(order.createdAt), startDate, endDate))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Filter and Sort Products by date (newest first)
    const filteredProducts = productsList
        .filter((prod) => isDateInRange(prod.date, startDate, endDate))
        .sort((a, b) => b.date.getTime() - a.date.getTime());

    return (
        <div className={s.reviewsPage}>
            <PersonalContentBlock className={s.reviewsBlock}>
                <PersonalPageHeader
                    title={dict.title}
                    logoutLabel={pDict.navigation.logout}
                    onLogout={handleLogout}
                    user={user}
                    navDict={pDict.navigation}
                />

                <div className={s.tabsRow}>
                    <button
                        className={clsx(s.tabBtn, activeTab === 'orders' && s.active)}
                        onClick={() => setActiveTab('orders')}
                    >
                        {dict.tabOrders}
                    </button>
                    <button
                        className={clsx(s.tabBtn, activeTab === 'products' && s.active)}
                        onClick={() => setActiveTab('products')}
                    >
                        {dict.tabProducts}
                    </button>
                </div>

                <div className={s.controlsRow}>
                    <DatePicker
                        id="reviews-date-range"
                        label={dict.filterDatePlaceholder}
                        selectsRange={true}
                        startDate={startDate}
                        endDate={endDate}
                        onChangeRange={handleDateChange}
                        onClear={handleClearDate}
                        maxDate={new Date()}
                        className={s.reviewsDatePicker}
                        lang={lang}
                    />
                </div>

                {loading ? (
                    <div className={s.loadingBlock}>{dict.loading}</div>
                ) : activeTab === 'orders' ? (
                    filteredOrders.length === 0 ? (
                        <div className={s.emptyBlock}>{dict.noOrders}</div>
                    ) : (
                        <div className={s.reviewsList}>
                            {filteredOrders.map((order) => {
                                const rev = orderReviews[order.id];
                                const hasReview = !!rev;
                                const productsImages =
                                    order.items?.map((item) => item.image?.list1x || '/images/product-placeholder.svg') || [];
                                
                                const orderDate = new Date(order.createdAt);
                                const dateStr = orderDate.toLocaleDateString('uk-UA', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                });
                                const timeStr = orderDate.toLocaleTimeString('uk-UA', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                });

                                return (
                                    <ReviewCard
                                        key={order.id}
                                        orderNumber={order.orderNo || order.id}
                                        date={dateStr}
                                        time={timeStr}
                                        products={productsImages}
                                        hasReview={hasReview}
                                        reviewText={rev?.text}
                                        rating={rev?.averageRating}
                                        onLeaveReview={() => openOrderReviewModal(order.id)}
                                        onEditReview={() => {
                                            const catsMap: Record<string, number> = {};
                                            rev?.ratings?.forEach((item) => {
                                                if (item.id === '1') catsMap.personnel = item.rating;
                                                if (item.id === '2') catsMap.service = item.rating;
                                                if (item.id === '4') catsMap.delivery = item.rating;
                                                if (item.id === '5') catsMap.product = item.rating;
                                            });
                                            openOrderReviewModal(order.id, {
                                                review: rev?.text,
                                                ratings: catsMap,
                                            });
                                        }}
                                        onDetails={() => router.push(`/${lang}/personal/orders/${order.id}`)}
                                        isDetailsOnly={false}
                                    />
                                );
                            })}
                        </div>
                    )
                ) : filteredProducts.length === 0 ? (
                    <div className={s.emptyBlock}>{dict.noProducts}</div>
                ) : (
                    <div className={s.reviewsList}>
                        {filteredProducts.map((prod) => {
                            const rev = productReviews[prod.id];
                            const hasReview = !!rev;

                            return (
                                <ProductReviewCard
                                    key={prod.id}
                                    productName={prod.name}
                                    productImage={prod.image}
                                    hasReview={hasReview}
                                    reviewText={rev?.text}
                                    rating={rev?.rating}
                                    onLeaveReview={() => openProductReviewModal(parseInt(prod.id), prod.name)}
                                    onEditReview={() =>
                                        openProductReviewModal(parseInt(prod.id), prod.name, {
                                            review: rev?.text,
                                            ratings: rev?.rating,
                                        })
                                    }
                                />
                            );
                        })}
                    </div>
                )}
            </PersonalContentBlock>

            {isModalOpen && (
                <PersonalReviewModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    orderNumber={selectedOrder?.id}
                    productId={selectedProduct?.id}
                    productName={selectedProduct?.name}
                    initialData={
                        selectedOrder
                            ? selectedOrder.review
                                ? { review: selectedOrder.review, ratings: selectedOrder.ratings }
                                : undefined
                            : selectedProduct
                            ? selectedProduct.review
                                ? { review: selectedProduct.review, ratings: selectedProduct.rating }
                                : undefined
                            : undefined
                    }
                    onSuccess={handleReviewSuccess}
                />
            )}
        </div>
    );
}
