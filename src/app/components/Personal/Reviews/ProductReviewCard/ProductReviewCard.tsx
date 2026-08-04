'use client';

import React from 'react';
import clsx from 'clsx';
import SafeProductImage from '@/app/components/ui/SafeProductImage/SafeProductImage';
import { useParams } from 'next/navigation';
import Button from '@/app/components/ui/Button/Button';
import AppLink from '@/app/components/ui/AppLink/AppLink';
import { useProductHref } from '@/hooks/useCategoryTree';
import s from './ProductReviewCard.module.scss';

interface ProductReviewCardProps {
    productId: string | number;
    productSlug?: string;
    categoryId?: number | string | null;
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
    categoryId,
    productName,
    productImage,
    hasReview,
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
    const productUrl = useProductHref(productSlug || String(productId), categoryId);

    return (
        <div className={s.card}>
            {(date || time) && (
                <div className={s.header}>
                    <div />
                    <div className={s.meta}>
                        {date && (
                            <div className={s.metaItem}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none">
                                    <path d="M9.35 1.1H8.25V0.55C8.25 0.404131 8.19205 0.264236 8.08891 0.161091C7.98576 0.0579462 7.84587 0 7.7 0C7.55413 0 7.41424 0.0579462 7.31109 0.161091C7.20795 0.264236 7.15 0.404131 7.15 0.55V1.1H3.85V0.55C3.85 0.404131 3.79205 0.264236 3.68891 0.161091C3.58576 0.0579462 3.44587 0 3.3 0C3.15413 0 3.01424 0.0579462 2.91109 0.161091C2.80795 0.264236 2.75 0.404131 2.75 0.55V1.1H1.65C1.21239 1.1 0.792709 1.27384 0.483274 1.58327C0.173839 1.89271 0 2.31239 0 2.75V9.35C0 9.78761 0.173839 10.2073 0.483274 10.5167C0.792709 10.8262 1.21239 11 1.65 11H9.35C9.78761 11 10.2073 10.8262 10.5167 10.5167C10.8262 10.2073 11 9.78761 11 9.35V2.75C11 2.31239 10.8262 1.89271 10.5167 1.58327C10.2073 1.27384 9.78761 1.1 9.35 1.1ZM9.9 9.35C9.9 9.49587 9.84205 9.63576 9.73891 9.73891C9.63576 9.84205 9.49587 9.9 9.35 9.9H1.65C1.50413 9.9 1.36424 9.84205 1.26109 9.73891C1.15795 9.63576 1.1 9.49587 1.1 9.35V5.5H9.9V9.35ZM9.9 4.4H1.1V2.75C1.1 2.60413 1.15795 2.46424 1.26109 2.36109C1.36424 2.25795 1.50413 2.2 1.65 2.2H2.75V2.75C2.75 2.89587 2.80795 3.03576 2.91109 3.13891C3.01424 3.24205 3.15413 3.3 3.3 3.3C3.44587 3.3 3.58576 3.24205 3.68891 3.13891C3.79205 3.03576 3.85 2.89587 3.85 2.75V2.2H7.15V2.75C7.15 2.89587 7.20795 3.03576 7.31109 3.13891C7.41424 3.24205 7.55413 3.3 7.7 3.3C7.84587 3.3 7.98576 3.24205 8.08891 3.13891C8.19205 3.03576 8.25 2.89587 8.25 2.75V2.2H9.35C9.49587 2.2 9.63576 2.25795 9.73891 2.36109C9.84205 2.46424 9.9 2.60413 9.9 2.75V4.4Z" fill="black"/>
                                </svg>
                                {date}
                            </div>
                        )}
                        {time && (
                            <div className={s.metaItem}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M7.5 2.1875C4.57063 2.1875 2.1875 4.57063 2.1875 7.5C2.1875 10.4294 4.57063 12.8125 7.5 12.8125C10.4294 12.8125 12.8125 10.4294 12.8125 7.5C12.8125 4.57063 10.4294 2.1875 7.5 2.1875ZM7.5 13.75C4.05375 13.75 1.25 10.9463 1.25 7.5C1.25 4.05375 4.05375 1.25 7.5 1.25C10.9463 1.25 13.75 4.05375 13.75 7.5C13.75 10.9463 10.9463 13.75 7.5 13.75Z" fill="black"/>
                                    <path fillRule="evenodd" clipRule="evenodd" d="M9.64531 9.8077C9.56344 9.8077 9.48094 9.78645 9.40531 9.74207L7.04906 8.33645C6.90781 8.25145 6.82031 8.09832 6.82031 7.93332V4.90332C6.82031 4.64457 7.03031 4.43457 7.28906 4.43457C7.54844 4.43457 7.75781 4.64457 7.75781 4.90332V7.66707L9.88594 8.93582C10.1078 9.06895 10.1809 9.35645 10.0484 9.57895C9.96031 9.72582 9.80469 9.8077 9.64531 9.8077Z" fill="black"/>
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
                                <SafeProductImage src={productImage} alt={displayName} width={80} height={60} style={{ objectFit: 'cover' }} />
                            </div>
                        ) : (
                            <AppLink
                                href={productUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={displayName}
                            >
                                <SafeProductImage src={productImage} alt={displayName} width={80} height={60} style={{ objectFit: 'cover' }} />
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
