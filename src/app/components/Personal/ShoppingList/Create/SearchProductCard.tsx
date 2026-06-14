'use client';

import React from 'react';
import Image from 'next/image';
import Button from '@/app/components/ui/Button/Button';
import { Locale } from '@/i18n/config';
import s from './ShoppingListCreateClient.module.scss';

const cardDict = {
    ua: {
        addToList: "ДОДАТИ ДО СПИСКУ",
    },
    ru: {
        addToList: "ДОБАВИТЬ В СПИСОК",
    }
};

interface SearchProductCardProps {
    name: string;
    price: number;
    weight?: string;
    image: string;
    onAdd: () => void;
    lang: Locale;
}

export default function SearchProductCard({ name, price, weight, image, onAdd, lang }: SearchProductCardProps) {
    const dict = cardDict[lang] || cardDict.ua;

    return (
        <div className={s.searchCard}>
            <div className={s.searchCardContent}>
                <Image src={image} className={s.searchCardImg} alt={name} width={120} height={90} />
                <div className={s.searchCardInfo}>
                    <h4 className={s.searchCardName}>{name} <span>{weight && `(${weight})`}</span></h4>
                    <div className={s.searchCardPrice}>{price.toLocaleString()} <span>₴</span></div>
                </div>
            </div>
            <Button variant="outline-black" className={s.addBtn} onClick={onAdd}>
                {dict.addToList}
            </Button>
        </div>
    );
}
