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
import ReviewCard from './ReviewCard/ReviewCard';
import PersonalReviewModal from './PersonalReviewModal/PersonalReviewModal';
import s from './ReviewsClient.module.scss';

const reviewsDict = {
    ua: {
        title: "МОЇ ВІДГУКИ",
        sortLabel: "Сортування:",
        sortOptions: ["По даті", "За оцінкою"],
    },
    ru: {
        title: "МОИ ОТЗЫВЫ",
        sortLabel: "Сортировка:",
        sortOptions: ["По дате", "По оценке"],
    }
};

const mockReviews = [
    {
        id: "2323423",
        date: "12.06.2025",
        time: "18:24",
        products: ["/images/product-ribeye.jpg", "/images/product-meatballs.jpg", "/images/product-sausages.jpg", "/images/product-shashlik.jpg", "/images/product-ribeye.jpg", "/images/product-meatballs.jpg", "/images/product-sausages.jpg", "/images/product-shashlik.jpg", "/images/product-ribeye.jpg"],
        hasReview: false,
    },
    {
        id: "2323425",
        date: "12.06.2025",
        time: "18:24",
        products: ["/images/product-ribeye.jpg", "/images/product-meatballs.jpg", "/images/product-sausages.jpg", "/images/product-shashlik.jpg"],
        hasReview: true,
        reviewText: "Замовляли м'ясо на ювілей, блюдо дуже сподобалось. М'ясо ніжне и сочне. Дуже смачно! Я думаю таке мясо должен попробовать каждый в домашних условиях.",
        rating: 3,
        ratings: { service: 3, personnel: 4, delivery: 2, product: 5 }
    },
    {
        id: "2323428",
        date: "12.06.2025",
        time: "18:24",
        products: ["/images/product-ribeye.jpg", "/images/product-meatballs.jpg", "/images/product-sausages.jpg"],
        hasReview: false,
    },
    {
        id: "2323430",
        date: "12.06.2025",
        time: "18:24",
        products: ["/images/product-shashlik.jpg"],
        hasReview: false,
    },
    {
        id: "2323435",
        date: "12.06.2025",
        time: "18:24",
        products: ["/images/product-ribeye.jpg", "/images/product-meatballs.jpg"],
        hasReview: false,
        isDetailsOnly: true
    }
];

interface ReviewsClientProps {
    lang: Locale;
}

export default function ReviewsClient({ lang }: ReviewsClientProps) {
    const hydrated = useIsHydrated();
    const dict = reviewsDict[lang] || reviewsDict.ua;
    const pDict = personalDict[lang] || personalDict.ua;
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { user } = useAppSelector((state) => state.auth);

    const [sortValue, setSortValue] = useState(dict.sortOptions[0]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<{id: string, ratings?: any, review?: string} | null>(null);

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

    const openReviewModal = (id: string, initialData?: any) => {
        setSelectedOrder({ id, ...initialData });
        setIsModalOpen(true);
    };

    if (!hydrated) {
        return null;
    }

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

                <div className={s.controlsRow}>
                    <SortSelect
                        value={sortValue}
                        options={dict.sortOptions}
                        onChange={setSortValue}
                        label={dict.sortLabel}
                        className={s.sortSelect}
                    />
                </div>

                <div className={s.reviewsList}>
                    {mockReviews.map((item) => (
                        <ReviewCard
                            key={item.id}
                            orderNumber={item.id}
                            date={item.date}
                            time={item.time}
                            products={item.products}
                            hasReview={item.hasReview}
                            reviewText={item.reviewText}
                            rating={item.rating}
                            onLeaveReview={() => openReviewModal(item.id)}
                            onEditReview={() => openReviewModal(item.id, { review: item.reviewText, ratings: item.ratings })}
                            onDetails={() => router.push(`/${lang}/personal/orders/${item.id}`)}
                            isDetailsOnly={item.isDetailsOnly}
                        />
                    ))}
                </div>
            </PersonalContentBlock>

            {selectedOrder && (
                <PersonalReviewModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    orderNumber={selectedOrder.id}
                    initialData={selectedOrder.review ? { review: selectedOrder.review, ratings: selectedOrder.ratings } : undefined}
                />
            )}
        </div>
    );
}
