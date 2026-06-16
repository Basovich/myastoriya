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
                        <h3 className={s.productName}>{displayName}</h3>
                    </div>
                </div>

                <div className={s.desktopAction}>
                    {hasReview ? (
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
                            {published === false && (
                                <div className={s.unmoderatedNote}>
                                    {lang === 'ru' ? '* Комментарий не модерирован' : '* Коментар не модерований'}
                                </div>
                            )}
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
                        ЗМІНИТИ ВІДГУК
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
