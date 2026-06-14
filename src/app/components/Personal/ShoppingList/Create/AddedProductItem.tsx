'use client';

import React from 'react';
import Image from 'next/image';
import s from './ShoppingListCreateClient.module.scss';

interface AddedProductItemProps {
    name: string;
    price: number;
    unitPrice?: string;
    weight: string;
    image: string;
    onRemove: () => void;
}

export default function AddedProductItem({ 
    name, 
    price, 
    unitPrice, 
    weight, 
    image, 
    onRemove 
}: AddedProductItemProps) {
    return (
        <div className={s.addedItem}>
            <div className={s.addedItemLeft}>
                <div className={s.addedItemImg}>
                    <Image src={image} alt={name} width={88} height={88} />
                </div>
                <div className={s.addedItemInfo}>
                    <h4 className={s.addedItemName}>{name}</h4>
                    {weight && <div className={s.addedItemWeight}>{weight}</div>}
                    <div className={s.addedItemPriceBlock}>
                        <span className={s.addedItemPrice}>{price.toLocaleString()} ₴</span>
                        {unitPrice && <span className={s.addedItemUnitPrice}>{unitPrice}</span>}
                    </div>
                </div>
            </div>
            <button className={s.removeBtn} onClick={onRemove} aria-label="Видалити">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="11.5" stroke="#F0F0F0" fill="white"/>
                    <path d="M15 9L9 15M9 9L15 15" stroke="#1C1B1B" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
            </button>
        </div>
    );
}
