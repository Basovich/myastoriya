'use client';

import React from 'react';
import Image from 'next/image';
import Button from '@/app/components/ui/Button/Button';
import s from './ShoppingListCreateClient.module.scss';

interface SearchProductCardProps {
    name: string;
    price: number;
    weight?: string;
    image: string;
    onAdd: () => void;
}

export default function SearchProductCard({ name, price, weight, image, onAdd }: SearchProductCardProps) {
    return (
        <div className={s.searchCard}>
            <div className={s.searchCardImg}>
                <Image src={image} alt={name} width={120} height={90} />
            </div>
            <div className={s.searchCardInfo}>
                <h4 className={s.searchCardName}>{name} {weight && `(${weight})`}</h4>
                <div className={s.searchCardPrice}>{price.toLocaleString()} ₴</div>
                <Button variant="outline-black" className={s.addBtn} onClick={onAdd}>
                    ДОДАТИ ДО СПИСКУ
                </Button>
            </div>
        </div>
    );
}
