'use client';

import React, { useState } from 'react';
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
            repeatBtn: "ПОВТОРИТЬ ЗАКАЗ",
            detailsBtn: "ДЕТАЛИ ЗАКАЗА",
        }
    }
};

const mockOrders = [
    {
        id: "2323423",
        status: "Видано кур'єру",
        statusVariant: 'success' as const,
        source: "з сайту",
        products: [
            "/images/product-ribeye.jpg",
            "/images/product-meatballs.jpg",
            "/images/product-sausages.jpg",
            "/images/product-shashlik.jpg",
        ],
        totalProductsCount: 27,
        sum: 12050,
        date: "12.06.2025",
        time: "18:24"
    },
    {
        id: "2323425",
        status: "Видано кур'єру",
        statusVariant: 'success' as const,
        source: "з сайту",
        products: [
            "/images/product-ribeye.jpg",
            "/images/product-meatballs.jpg",
            "/images/product-sausages.jpg",
            "/images/product-shashlik.jpg",
        ],
        totalProductsCount: 27,
        sum: 12050,
        oldSum: 13240,
        date: "12.06.2025",
        time: "18:24"
    },
    {
        id: "2323428",
        status: "Видано кур'єру",
        statusVariant: 'success' as const,
        source: "з сайту",
        products: [
            "/images/product-ribeye.jpg",
            "/images/product-meatballs.jpg",
            "/images/product-sausages.jpg",
            "/images/product-shashlik.jpg",
        ],
        totalProductsCount: 27,
        sum: 12050,
        oldSum: 13240,
        date: "12.06.2025",
        time: "18:24"
    }
];

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

    if (!hydrated) {
        return null;
    }

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

                <div className={s.ordersList}>
                    {mockOrders.map((order) => (
                        <OrderCard
                            key={order.id}
                            orderNumber={order.id}
                            status={order.status}
                            statusVariant={order.statusVariant}
                            source={order.source}
                            products={order.products}
                            totalProductsCount={order.totalProductsCount}
                            sum={order.sum}
                            oldSum={order.oldSum}
                            date={order.date}
                            time={order.time}
                            dict={dict.card}
                            onRepeatOrder={() => console.log('Repeat order', order.id)}
                            onDetails={() => router.push(`/${lang}/personal/orders/${order.id}`)}
                            onReview={() => console.log('Review order', order.id)}
                        />
                    ))}
                </div>
            </PersonalContentBlock>
        </div>
    );
}
