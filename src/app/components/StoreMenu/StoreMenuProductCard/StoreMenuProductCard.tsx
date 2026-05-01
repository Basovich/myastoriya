'use client';

import React from 'react';
import s from './StoreMenuProductCard.module.scss';
import Image from 'next/image';
import Button from '@/app/components/ui/Button/Button';
import AddToCartButton from '@/app/components/ui/AddToCartButton/AddToCartButton';

interface StoreMenuProductCardProps {
    id: number | string;
    title: string;
    description?: string;
    price: number;
    weight: string;
    unit: string;
    image: string;
}

const StoreMenuProductCard: React.FC<StoreMenuProductCardProps> = ({
    id,
    title,
    description,
    price,
    weight,
    unit,
    image,
}) => {
    return (
        <div className={s.card}>
            <div className={s.imageWrapper}>
                {image ? (
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className={s.productImg}
                    />
                ) : (
                    <div className={s.imageFallback}>
                        <Image src="/icons/logo-red.svg" alt={title} width={60} height={60} />
                    </div>
                )}
            </div>
            <div className={s.content}>
                <h3 className={s.title}>{title}</h3>
                <div className={s.details}>
                    <span className={s.price}>{price} ₴</span>
                    <span className={s.unit}>{weight}</span>
                </div>
                {description && <p className={s.description}>{description}</p>}
                <span className={s.weight}>{weight}</span>
            </div>
        </div>
    );
};

export default StoreMenuProductCard;
