'use client';

import React from 'react';
import clsx from 'clsx';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Button from '@/app/components/ui/Button/Button';
import AppLink from '@/app/components/ui/AppLink/AppLink';
import s from './ProductReviewCard.module.scss';

interface ProductReviewCardProps {
    productId: string | number;
    productSlug?: string;
    productName: string;
    productImage?: string | null;
    hasReview: boolean;
    published?: boolean;
    reviewText?: string;
    rating?: number;
    onLeaveReview: () => void;
    onEditReview: () => void;
    date?: string;
    time?: string;
}

export default function ProductReviewCard({
    productId,
    productSlug,
    productName,
    productImage,
    hasReview,
    published,
    reviewText,
    rating = 0,
    onLeaveReview,
    onEditReview,
    date,
    time,
}: ProductReviewCardProps) {
    const params = useParams();
    const lang = params.lang || 'ua';
    
    const isDeleted = productName.startsWith('cms-orders::') || productName.toLowerCase().includes('deleted');
    const deletedTitle = lang === 'ru' ? 'Товар удален' : 'Товар видалено';
    const displayName = isDeleted ? deletedTitle : productName;

    const fallbackImage = '/images/product-placeholder.svg';
    const displayImage = productImage || fallbackImage;
    const productUrl = productSlug ? `/products/${productSlug}` : `/products/${productId}`;

    return (
        <div className={s.card}>
            {(date || time) && (
                <div className={s.header}>
                    <div />
                    <div className={s.meta}>
                        {date && (
                            <div className={s.metaItem}>
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M12.25 1.75H11.375V0.875H10.5V1.75H3.5V0.875H2.625V1.75H1.75C1.26875 1.75 0.875 2.14375 0.875 2.625V12.25C0.875 12.7313 1.26875 13.125 1.75 13.125H12.25C12.7313 13.125 13.125 12.7313 13.125 12.25V2.625C13.125 2.14375 12.7313 1.75 12.25 1.75ZM12.25 12.25H1.75V4.375H12.25V12.25Z" fill="#1C1B1B"/>
                                </svg>
                                {date}
                            </div>
                        )}
                        {time && (
                            <div className={s.metaItem}>
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M7 0C3.13437 0 0 3.13437 0 7C0 10.8656 3.13437 14 7 14C10.8656 14 14 10.8656 14 7C14 3.13437 10.8656 0 7 0ZM7 12.6875C3.86563 12.6875 1.3125 10.1344 1.3125 7C1.3125 3.86563 3.86563 1.3125 7 1.3125C10.1344 1.3125 12.6875 3.86563 12.6875 7C12.6875 10.1344 10.1344 12.6875 7 12.6875ZM7.4375 3.5H6.125V7.4375L9.625 9.5375L10.2812 8.46562L7.4375 6.78125V3.5Z" fill="#1C1B1B"/>
                                </svg>
                                {time}
                            </div>
                        )}
                    </div>
                </div>
            )}
            <div className={s.content}>
                <div className={s.productInfo}>
                    <div className={s.productImg}>
                        {isDeleted ? (
                            <div title={displayName} style={{ cursor: 'default', width: '100%', height: '100%' }}>
                                <Image src={displayImage} alt={displayName} width={80} height={60} style={{ objectFit: 'cover' }} />
                            </div>
                        ) : (
                            <AppLink
                                href={productUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={displayName}
                            >
                                <Image src={displayImage} alt={displayName} width={80} height={60} style={{ objectFit: 'cover' }} />
                            </AppLink>
                        )}
                    </div>
                    <div className={s.productMeta}>
                        {isDeleted ? (
                            <h3 className={s.productName}>{displayName}</h3>
                        ) : (
                            <AppLink
                                href={productUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={s.productLink}
                                title={displayName}
                            >
                                <h3 className={s.productName}>{displayName}</h3>
                            </AppLink>
                        )}
                    </div>
                </div>

                <div className={s.desktopAction}>
                    {hasReview ? (
                        <Button onClick={onEditReview} variant="black" className={s.actionBtn}>
                            {lang === 'ru' ? 'ИЗМЕНИТЬ ОТЗЫВ' : 'ЗМІНИТИ ВІДГУК'}
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
                {hasReview ? (
                    <Button onClick={onEditReview} variant="black" className={s.actionBtn}>
                        {lang === 'ru' ? 'ИЗМЕНИТЬ ОТЗЫВ' : 'ЗМІНИТИ ВІДГУК'}
                    </Button>
                ) : (
                    <Button onClick={onLeaveReview} variant="red" className={s.actionBtn}>
                        ЗАЛИШИТИ ВІДГУК
                    </Button>
                )}
            </div>
        </div>
    );
}
