'use client';

import React from 'react';
import clsx from 'clsx';
import Image from 'next/image';
import Button from '@/app/components/ui/Button/Button';
import s from './ProductReviewCard.module.scss';

interface ProductReviewCardProps {
    productName: string;
    productImage?: string | null;
    hasReview: boolean;
    reviewText?: string;
    rating?: number;
    onLeaveReview: () => void;
    onEditReview: () => void;
}

export default function ProductReviewCard({
    productName,
    productImage,
    hasReview,
    reviewText,
    rating = 0,
    onLeaveReview,
    onEditReview,
}: ProductReviewCardProps) {
    const fallbackImage = '/images/product-placeholder.svg';
    const displayImage = productImage || fallbackImage;

    return (
        <div className={s.card}>
            <div className={s.content}>
                <div className={s.productInfo}>
                    <div className={s.productImg}>
                        <Image src={displayImage} alt={productName} width={80} height={60} style={{ objectFit: 'cover' }} />
                    </div>
                    <div className={s.productMeta}>
                        <h3 className={s.productName}>{productName}</h3>
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
