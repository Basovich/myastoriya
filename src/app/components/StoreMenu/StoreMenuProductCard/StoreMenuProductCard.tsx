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
                <Image
                    src={image}
                    alt={title}
                    fill
                    className={s.productImg}
                />
            </div>
            <div className={s.content}>
                <div className={s.header}>
                    <h3 className={s.title}>{title}</h3>
                    <div className={s.priceInfo}>
                        <span className={s.price}>{price} ₴</span>
                        <span className={s.unit}>- {weight} / {unit}</span>
                    </div>
                </div>
                {description && <p className={s.description}>{description}</p>}
                <div className={s.footer}>
                    {/* Reuse AddToCartButton if it exists and works with strings, or a custom one for now */}
                    <AddToCartButton productId={String(id)} />
                </div>
            </div>
        </div>
    );
};

export default StoreMenuProductCard;
