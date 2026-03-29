'use client';

import s from './index.module.scss';
import Image from 'next/image';
import Badge from '@/app/components/ui/Badge/Badge';
import WishButton from '@/app/components/ui/WishButton/WishButton';
import AddToCartButton from '@/app/components/ui/AddToCartButton/AddToCartButton';
import AppLink from '@/app/components/ui/AppLink/AppLink';

interface ProductCardRowProps {
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

export default function ProductCardRow({
    id,
    title,
    weight,
    price,
    oldPrice,
    unit,
    badge,
    image,
    description,
}: ProductCardRowProps) {
    const productUrl = `/products/${id}`;

    return (
        <div className={s.card}>
            <div className={s.imageWrap}>
                <AppLink href={productUrl} className={s.imageLink}>
                    <Image
                        src={image}
                        alt={title}
                        className={s.productImg}
                        width={400}
                        height={300}
                        priority
                    />
                </AppLink>
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
                <AppLink href={productUrl} className={s.titleLink}>
                    <h3 className={s.title}>{title}</h3>
                </AppLink>
                {description && (
                    <p className={s.description}>{description}</p>
                )}
                <div className={s.footer}>
                    <div className={s.priceGroup}>
                        <div className={s.priceRow}>
                            <span className={s.price}>{price.toLocaleString('uk-UA')} ₴</span>
                            {oldPrice && (
                                <span className={s.oldPrice}>{oldPrice.toLocaleString('uk-UA')} ₴</span>
                            )}
                        </div>
                        <span className={s.unit}>{unit}</span>
                    </div>
                    <AddToCartButton productId={String(id)} />
                </div>
            </div>
        </div>
    );
}
