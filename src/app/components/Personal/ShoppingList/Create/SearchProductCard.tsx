import React from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import Button from '@/app/components/ui/Button/Button';
import AppLink from '@/app/components/ui/AppLink/AppLink';
import { Locale } from '@/i18n/config';
import { useProductHref } from '@/hooks/useCategoryTree';
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
    categoryId?: number | string | null;
    price: number;
    oldPrice?: number;
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
    categoryId,
    price, 
    oldPrice,
    weight, 
    image, 
    onAdd, 
    lang, 
    isAdded = false 
}: SearchProductCardProps) {
    const dict = cardDict[lang] || cardDict.ua;
    const productUrl = useProductHref(slug || String(productId), categoryId);

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
                    <div className={s.searchCardPriceBlock}>
                        <span className={clsx(s.searchCardPrice, oldPrice && oldPrice > price && s.searchCardPriceNew)}>
                            {formatPrice(price)} <span>₴</span>
                        </span>
                        {oldPrice && oldPrice > price && (
                            <span className={s.searchCardPriceOld}>
                                {formatPrice(oldPrice)} <span>₴</span>
                            </span>
                        )}
                    </div>
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
