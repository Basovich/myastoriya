'use client';

import React from 'react';
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
        mockComment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla co"
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
        mockComment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla co"
    }
};

const mockProducts = [
    {
        id: "1",
        title: "М’ясні палички з сиром",
        weight: "330г / 340г / 200г",
        price: 2500,
        unit: "упаковка",
        image: "/images/product-ribeye.jpg",
        badge: "SALE"
    },
    {
        id: "2",
        title: "М’ясні палички в соусі Териякі",
        weight: "330г / 340г / 200г",
        price: 2600,
        unit: "упаковка",
        image: "/images/product-meatballs.jpg",
        badge: "NEW"
    },
    {
        id: "3",
        title: "М’ясні палички з сиром",
        weight: "330г / 340г / 200г",
        price: 2500,
        unit: "упаковка",
        image: "/images/product-sausages.jpg",
        badge: "SALE"
    },
    {
        id: "4",
        title: "М’ясні палички в соусі Териякі",
        weight: "330г / 340г / 200г",
        price: 2600,
        unit: "упаковка",
        image: "/images/product-shashlik.jpg",
        badge: "NEW"
    },
    {
        id: "5",
        title: "М’ясні палички з сиром",
        weight: "330г / 340г / 200г",
        price: 2500,
        unit: "упаковка",
        image: "/images/product-ribeye.jpg",
        badge: "SALE"
    },
    {
        id: "6",
        title: "М’ясні палички в соусі Териякі",
        weight: "330г / 340г / 200г",
        price: 2600,
        unit: "упаковка",
        image: "/images/product-meatballs.jpg",
        badge: "NEW"
    }
];

const mockStatusSteps: StatusStep[] = [
    { label: "Нове замовлення", date: "12.08.2025", time: "15:00", isCompleted: true },
    { label: "Готується", date: "12.08.2025", time: "15:10", isCompleted: true },
    { label: "Видано кур’єру", date: "12.08.2025", time: "15:30", isCompleted: true, isCurrent: true },
    { label: "Доставлено", date: "12.08.2025", time: "16:10", isCompleted: false },
    { label: "Завершено", date: "12.08.2025", time: "16:30", isCompleted: false },
];

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
        <div className={s.orderDetailsPage}>
            <PersonalContentBlock className={s.detailsBlock}>
                <PersonalPageHeader 
                    title={`${dict.orderTitle}${orderId}`}
                    logoutLabel={pDict.navigation.logout}
                    onLogout={handleLogout}
                    user={user}
                    navDict={pDict.navigation}
                />
                
                <div className={s.decorativeDots}>
                    <span /> <span /> <span />
                </div>

                <div className={s.metaRow}>
                    <div className={s.metaItem}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.25 1.75H11.375V0.875H10.5V1.75H3.5V0.875H2.625V1.75H1.75C1.26875 1.75 0.875 2.14375 0.875 2.625V12.25C0.875 12.7313 1.26875 13.125 1.75 13.125H12.25C12.7313 13.125 13.125 12.7313 13.125 12.25V2.625C13.125 2.14375 12.7313 1.75 12.25 1.75ZM12.25 12.25H1.75V4.375H12.25V12.25Z" fill="#1C1B1B"/>
                        </svg>
                        <span>12.08.2025</span>
                    </div>
                    <div className={s.metaItem}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7 0C3.13437 0 0 3.13437 0 7C0 10.8656 3.13437 14 7 14C10.8656 14 14 10.8656 14 7C14 3.13437 10.8656 0 7 0ZM7 12.6875C3.86563 12.6875 1.3125 10.1344 1.3125 7C1.3125 3.86563 3.86563 1.3125 7 1.3125C10.1344 1.3125 12.6875 3.86563 12.6875 7C12.6875 10.1344 10.1344 12.6875 7 12.6875ZM7.4375 3.5H6.125V7.4375L9.625 9.5375L10.2812 8.46562L7.4375 6.78125V3.5Z" fill="#1C1B1B"/>
                        </svg>
                        <span>18:24</span>
                    </div>
                    <div className={s.sourceItem}>
                        {dict.sourcePrefix} <strong>{dict.sourceValue}</strong>
                    </div>
                </div>

                <div className={s.section}>
                    <h2 className={s.sectionTitle}>{dict.productsHeading}</h2>
                    <div className={s.productsGrid}>
                        {mockProducts.map((product) => (
                            <ProductCard 
                                key={product.id}
                                id={product.id}
                                title={product.title}
                                weight={product.weight}
                                price={product.price}
                                unit={product.unit}
                                image={product.image}
                                badge={product.badge}
                                lang={lang}
                            />
                        ))}
                    </div>
                </div>

                <div className={s.summaryGrid}>
                    <div className={s.summaryItem}>
                        <span className={s.summaryLabel}>{dict.summary.persons}</span>
                        <span className={s.summaryValue}>3 <strong>{dict.summary.unit}</strong></span>
                    </div>
                    <div className={s.summaryItem}>
                        <span className={s.summaryLabel}>{dict.summary.discount}</span>
                        <span className={clsx(s.summaryValue, s.negative)}>-5 500 <strong>₴</strong></span>
                    </div>
                    <div className={s.summaryItem}>
                        <span className={s.summaryLabel}>{dict.summary.delivery}</span>
                        <span className={s.summaryValue}>500 <strong>₴</strong></span>
                    </div>
                    <div className={s.summaryItem}>
                        <span className={s.summaryLabel}>{dict.summary.total}</span>
                        <span className={s.summaryValue}>12 500 <strong>₴</strong></span>
                    </div>
                </div>

                <div className={s.detailsGrid}>
                    <div className={s.statusCol}>
                        <h2 className={s.sectionTitle}>{dict.statusHeading}</h2>
                        <OrderStatusTimeline steps={mockStatusSteps} />
                    </div>
                    
                    <div className={s.infoCol}>
                        <div className={s.infoBlock}>
                            <h2 className={s.sectionTitle}>{dict.deliveryTime}</h2>
                            <p className={s.infoText}>Середа, 14 Квітня, 18:00 - 19:00</p>
                        </div>
                        
                        <div className={s.infoBlock}>
                            <h2 className={s.sectionTitle}>{dict.deliveryType}</h2>
                            <p className={s.infoText}>Кур’єр М’ясторія</p>
                        </div>

                        <div className={s.infoBlock}>
                            <h2 className={s.sectionTitle}>{dict.commentHeading}</h2>
                            <p className={s.infoText}>{dict.mockComment}</p>
                        </div>
                    </div>
                </div>

                <div className={s.actionsRow}>
                    <button className={s.reviewLink}>{dict.reviewBtn}</button>
                    <Button variant="black" className={s.repeatBtn}>
                        {dict.repeatBtn}
                    </Button>
                </div>
                
                <div className={s.backLinkRow}>
                    <AppLink href={`/${lang}/personal/orders`} className={s.backLink}>
                        {dict.backToHistory}
                    </AppLink>
                </div>
            </PersonalContentBlock>
        </div>
    );
}
