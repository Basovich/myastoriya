'use client';

import React from 'react';
import s from './StoreMenuProductCard.module.scss';
import Image from 'next/image';
import { RestaurantProduct } from '@/lib/graphql/queries/pages/restaurantMenu';

interface StoreMenuProductCardProps {
    product: RestaurantProduct;
}

const SpicyIcon = () => (
    <div className={s.spicyBadge} title="Гостра страва">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C11.5 3.5 10 5.5 8 7C6 8.5 4.5 10.5 4.1 13C3.5 16.5 6 20 9.5 20.8C13 21.6 16.5 19.5 17.5 16C18.5 12.5 16.5 9 14.5 7.5C13.5 6.7 12.8 5.5 12.5 4.2C12.3 3.5 12.1 2.8 12 2Z" fill="#E30613" />
            <path d="M12.5 2C13 3 14 3.5 14.5 3C15 2.5 14.5 1.5 14 1" stroke="#2D9A47" strokeWidth="2" strokeLinecap="round" />
        </svg>
    </div>
);

const StoreMenuProductCard: React.FC<StoreMenuProductCardProps> = ({ product }) => {
    const isOutOfStock = product.available === 0;
    const hasDiscount = product.oldCost > product.cost;
    
    // Resolve image URL (using placeholder if missing)
    const imgUrl = product.image?.url?.main2x || product.image?.url?.grid2x || '/images/product-placeholder.svg';
    const altText = product.image?.alt || product.name;

    return (
        <div className={`${s.card} ${isOutOfStock ? s.unavailable : ''}`}>
            <div className={s.imageWrapper}>
                <Image
                    src={imgUrl}
                    alt={altText}
                    fill
                    className={s.productImg}
                />
                
                {product.isSpicy && <SpicyIcon />}
                
                {isOutOfStock && (
                    <div className={s.unavailableBadge}>Немає в наявності</div>
                )}
            </div>
            
            <div className={s.content}>
                <h3 className={s.title}>{product.name}</h3>
                
                <div className={s.details}>
                    <span className={s.price}>{product.cost} ₴</span>
                    {hasDiscount && (
                        <span className={s.oldPrice}>{product.oldCost} ₴</span>
                    )}
                    {product.portionSize && (
                        <span className={s.unit}>{product.portionSize}</span>
                    )}
                </div>
                
                {product.dishSpecifics && product.dishSpecifics.length > 0 && (
                    <div className={s.specifics}>
                        {product.dishSpecifics.map(spec => (
                            <span key={spec.key} className={s.specBadge}>
                                {spec.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoreMenuProductCard;
