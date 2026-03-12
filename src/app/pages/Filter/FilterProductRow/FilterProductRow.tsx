'use client';

import s from './FilterProductRow.module.scss';
import Image from 'next/image';
import Badge from '@/app/components/ui/Badge/Badge';
import WishButton from '@/app/components/ui/WishButton/WishButton';
import AddToCartButton from '@/app/components/ui/AddToCartButton/AddToCartButton';

interface SearchProductRowProps {
    id: number | string;
    title: string;
    weight: string;
    price: number;
    oldPrice?: number;
    unit: string;
    badge?: string | null;
    image: string;
    description?: string;
}

export default function FilterProductRow({
    id,
    title,
    weight,
    price,
    oldPrice,
    unit,
    badge,
    image,
    description,
}: SearchProductRowProps) {
    return (
        <div className={s.card}>
            <div className={s.imageWrap}>
                <Image
                    src={image}
                    alt={title}
                    className={s.productImg}
                    width={200}
                    height={160}
                />
                {badge && (
                    <Badge
                        variant={badge.toLowerCase() === 'new' ? 'new' : 'sale'}
                        className={s.badge}
                    >
                        {badge}
                    </Badge>
                )}
                <WishButton productId={String(id)} className={s.favorite} />
                <span className={s.weight}>{weight}</span>
            </div>

            <div className={s.info}>
                <h3 className={s.title}>{title}</h3>
                {description && (
                    <p className={s.description}>{description}</p>
                )}
                <div className={s.footer}>
                    <div className={s.priceGroup}>
                        <span className={s.price}>{price.toLocaleString('uk-UA')} ₴</span>
                        {oldPrice && (
                            <span className={s.oldPrice}>{oldPrice.toLocaleString('uk-UA')} ₴</span>
                        )}
                        <span className={s.unit}>{unit}</span>
                    </div>
                    <AddToCartButton productId={String(id)} />
                </div>
            </div>
        </div>
    );
}
