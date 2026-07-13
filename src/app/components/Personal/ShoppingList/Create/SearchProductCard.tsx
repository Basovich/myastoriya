import React from 'react';
import Image from 'next/image';
import Button from '@/app/components/ui/Button/Button';
import AppLink from '@/app/components/ui/AppLink/AppLink';
import { Locale } from '@/i18n/config';
import { formatPrice } from '@/utils/price';
import s from './ShoppingListCreateClient.module.scss';

const cardDict = {
    ua: {
        addToList: "ДОДАТИ ДО СПИСКУ",
        addedToList: "ТОВАР ДОДАНО В СПИСОК",
    },
    ru: {
        addToList: "ДОБАВИТЬ В СПИСОК",
        addedToList: "ТОВАР ДОБАВЛЕН В СПИСОК",
    }
};

interface SearchProductCardProps {
    name: string;
    productId: number | string;
    slug?: string;
    price: number;
    weight?: string;
    image: string;
    onAdd: () => void;
    lang: Locale;
    isAdded?: boolean;
}

export default function SearchProductCard({ 
    name, 
    productId,
    slug,
    price, 
    weight, 
    image, 
    onAdd, 
    lang, 
    isAdded = false 
}: SearchProductCardProps) {
    const dict = cardDict[lang] || cardDict.ua;
    const productUrl = slug ? `/products/${slug}` : `/products/${productId}`;

    return (
        <div className={s.searchCard}>
            <div className={s.searchCardContent}>
                <Image src={image} className={s.searchCardImg} alt={name} width={120} height={90} />
                <div className={s.searchCardInfo}>
                    <h4 className={s.searchCardName}>
                        <AppLink href={productUrl} target="_blank" rel="noopener noreferrer">
                            {name}
                        </AppLink>
                        {' '}
                        <span>{weight && `(${weight})`}</span>
                    </h4>
                    <div className={s.searchCardPrice}>{formatPrice(price)} <span>₴</span></div>
                </div>
            </div>
            <Button 
                variant={isAdded ? "black" : "outline-black"} 
                className={`${s.addBtn} ${isAdded ? s.added : ''}`} 
                onClick={onAdd}
                disabled={isAdded}
            >
                {isAdded ? dict.addedToList : dict.addToList}
            </Button>
        </div>
    );
}
