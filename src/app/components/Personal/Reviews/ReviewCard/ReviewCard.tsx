'use client';

import React from 'react';
import clsx from 'clsx';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Button from '@/app/components/ui/Button/Button';
import AppLink from '@/app/components/ui/AppLink/AppLink';
import s from './ReviewCard.module.scss';

export interface ReviewProduct {
    id: string;
    name: string;
    image: string;
    slug?: string;
    isDeleted?: boolean;
}

interface ReviewCardProps {
    orderNumber: string;
    date: string;
    time: string;
    products: ReviewProduct[];
    hasReview: boolean;
    reviewText?: string;
    rating?: number;
    onLeaveReview: () => void;
    onEditReview: () => void;
    onDetails?: () => void;
    isDetailsOnly?: boolean;
}

export default function ReviewCard({
    orderNumber,
    date,
    time,
    products,
    hasReview,
    reviewText,
    rating = 0,
    onLeaveReview,
    onEditReview,
    onDetails,
    isDetailsOnly
}: ReviewCardProps) {
    const params = useParams();
    const lang = params.lang || 'ua';

    return (
        <div className={s.card}>
            <div className={s.header}>
                <h3 className={s.orderNum}>Замовлення <strong>№{orderNumber}</strong></h3>
                <div className={s.meta}>
                    <div className={s.metaItem}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M12.25 1.75H11.375V0.875H10.5V1.75H3.5V0.875H2.625V1.75H1.75C1.26875 1.75 0.875 2.14375 0.875 2.625V12.25C0.875 12.7313 1.26875 13.125 1.75 13.125H12.25C12.7313 13.125 13.125 12.7313 13.125 12.25V2.625C13.125 2.14375 12.7313 1.75 12.25 1.75ZM12.25 12.25H1.75V4.375H12.25V12.25Z" fill="#1C1B1B"/>
                        </svg>
                        {date}
                    </div>
                    <div className={s.metaItem}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M7 0C3.13437 0 0 3.13437 0 7C0 10.8656 3.13437 14 7 14C10.8656 14 14 10.8656 14 7C14 3.13437 10.8656 0 7 0ZM7 12.6875C3.86563 12.6875 1.3125 10.1344 1.3125 7C1.3125 3.86563 3.86563 1.3125 7 1.3125C10.1344 1.3125 12.6875 3.86563 12.6875 7C12.6875 10.1344 10.1344 12.6875 7 12.6875ZM7.4375 3.5H6.125V7.4375L9.625 9.5375L10.2812 8.46562L7.4375 6.78125V3.5Z" fill="#1C1B1B"/>
                        </svg>
                        {time}
                    </div>
                </div>
            </div>

            <div className={s.content}>
                <div className={s.productsRow}>
                    <div className={s.productsList}>
                        {products.slice(0, 8).map((prod, i) => {
                            const isDeleted = prod.isDeleted || prod.name.startsWith('cms-orders::') || prod.name.toLowerCase().includes('deleted');
                            const deletedTitle = lang === 'ru' ? 'Товар удален' : 'Товар видалено';
                            const titleText = isDeleted ? deletedTitle : prod.name;
                            const productUrl = prod.slug ? `/products/${prod.slug}` : `/products/${prod.id}`;

                            if (isDeleted) {
                                return (
                                    <div
                                        key={i}
                                        className={s.productThumb}
                                        title={titleText}
                                        style={{ cursor: 'default' }}
                                    >
                                        <Image src={prod.image} alt={titleText} width={56} height={42} />
                                    </div>
                                );
                            }

                            return (
                                <AppLink
                                    key={i}
                                    href={productUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={titleText}
                                    className={s.productThumb}
                                >
                                    <Image src={prod.image} alt={titleText} width={56} height={42} />
                                </AppLink>
                            );
                        })}
                        {products.length > 8 && (
                            <div className={s.moreThumb}>
                                <span>{products.length - 8}</span>
                            </div>
                        )}
                    </div>
                    
                    <div className={s.desktopAction}>
                        {isDetailsOnly ? (
                            <Button onClick={onDetails} variant="red" className={s.actionBtn}>
                                ДЕТАЛІ ЗАМОВЛЕННЯ
                            </Button>
                        ) : hasReview ? (
                            <Button onClick={onEditReview} variant="black" className={s.actionBtn}>
                                ЗМІНИТИ ВІДГУК
                            </Button>
                        ) : (
                            <Button onClick={onLeaveReview} variant="red" className={s.actionBtn}>
                                ЗАЛИШИТИ ВІДГУК
                            </Button>
                        )}
                    </div>
                </div>

                {hasReview && reviewText && (
                    <div className={s.reviewBlock}>
                        <div className={s.reviewInfo}>
                            <div className={s.textGroup}>
                                <h4 className={s.reviewLabel}>Ваш відгук</h4>
                                <p className={s.reviewText}>{reviewText}</p>
                            </div>
                            <div className={s.ratingGroup}>
                                <h4 className={s.reviewLabel}>Ваша оцінка</h4>
                                <div className={s.stars}>
                                    {Array.from({ length: 5 }, (_, i) => (
                                        <svg key={i} width="24" height="24" viewBox="0 0 24 24" fill="none" className={clsx(s.star, i < rating && s.starFilled)}>
                                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#E30613" fill="currentColor" strokeWidth="1.5" />
                                        </svg>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className={s.mobileAction}>
                    {isDetailsOnly ? (
                        <Button onClick={onDetails} variant="red" className={s.actionBtn}>
                            ДЕТАЛІ ЗАМОВЛЕННЯ
                        </Button>
                    ) : hasReview ? (
                        <Button onClick={onEditReview} variant="black" className={s.actionBtn}>
                            ЗМІНИТИ ВІДГУК
                        </Button>
                    ) : (
                        <Button onClick={onLeaveReview} variant="red" className={s.actionBtn}>
                            ЗАЛИШИТИ ВІДГУК
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
