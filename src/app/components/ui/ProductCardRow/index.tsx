"use client";

import s from './index.module.scss';
import Image from 'next/image';
import Badge from '@/app/components/ui/Badge/Badge';
import WishButton from '@/app/components/ui/WishButton/WishButton';
import AddToCartButton from '@/app/components/ui/AddToCartButton/AddToCartButton';
import AppLink from '@/app/components/ui/AppLink/AppLink';
import clsx from "clsx";
import { useProductHref } from '@/hooks/useCategoryTree';


interface ProductCardRowProps {
    id: number | string;
    slug?: string;
    categoryId?: number | string | null;
    title: string;
    weight: string;
    price: number;
    oldPrice?: number;
    unit: string;
    badge?: string | null;
    image: string;
    description?: string;
    lang: string;
    hasCostVariants?: boolean;
}

export default function ProductCardRow({
    id,
    slug,
    categoryId,
    title,
    weight,
    price,
    oldPrice,
    unit,
    badge,
    image,
    description,
    lang,
    hasCostVariants = false,
}: ProductCardRowProps) {
    const isRu = lang === 'ru';
    
    // Format weight if it is just a number
    let formattedWeight = weight;
    if (weight && /^\d+([.,]\d+)?$/.test(weight.trim())) {
        const num = parseFloat(weight.trim().replace(',', '.'));
        const roundedWeight = num >= 10 ? Math.round(num) : Math.round(num * 100) / 100;
        
        const titleLower = title.toLowerCase();
        const unitLower = unit.toLowerCase().trim();
        
        if (num === 1) {
            if (unitLower === 'шт') {
                formattedWeight = '1 шт';
            } else if (unitLower === 'уп') {
                formattedWeight = '1 уп';
            } else if (unitLower === 'кг' || unitLower === 'kg') {
                formattedWeight = '1 кг';
            } else if (unitLower === 'г' || unitLower === 'g') {
                formattedWeight = '1 г';
            } else if (unitLower === 'мл' || unitLower === 'ml') {
                formattedWeight = '1 мл';
            } else if (unitLower === 'л' || unitLower === 'l') {
                formattedWeight = '1 л';
            } else {
                formattedWeight = '1 шт';
            }
        } else {
            if (unitLower === 'шт') {
                const isLiquid = /вино|пиво|сік|сок|вод|кола|нектар|напій|напиток|лимонад|сидр|wine|beer|juice|beverage/i.test(titleLower);
                formattedWeight = `${roundedWeight} ${isLiquid ? 'мл' : 'г'}`;
            } else if (unitLower === 'уп') {
                formattedWeight = `${roundedWeight} уп`;
            } else if (unitLower === 'кг' || unitLower === 'kg') {
                formattedWeight = `${roundedWeight} кг`;
            } else if (unitLower === 'г' || unitLower === 'g') {
                formattedWeight = `${roundedWeight} г`;
            } else if (unitLower === 'мл' || unitLower === 'ml') {
                formattedWeight = `${roundedWeight} мл`;
            } else if (unitLower === 'л' || unitLower === 'l') {
                formattedWeight = `${roundedWeight} л`;
            } else {
                const isLiquid = unitLower.includes('мл') || unitLower.includes('ml') || 
                    /вино|пиво|сік|сок|вод|кола|нектар|напій|напиток|лимонад|сидр|wine|beer|juice|beverage/i.test(titleLower);
                formattedWeight = `${roundedWeight} ${isLiquid ? 'мл' : 'г'}`;
            }
        }
    }

    const displayWeight = (formattedWeight === "1" || formattedWeight === "1.0")
        ? (unit.toLowerCase().trim() === 'шт' ? '1 шт' : (isRu ? "1 единица" : "1 одиниця"))
        : formattedWeight;

    const displayUnit = unit.toLowerCase() === "шт"
        ? (isRu ? "За 1 шт" : "За 1 шт")
        : `За ${unit}`;

    const productUrl = useProductHref(slug || String(id), categoryId);



    return (
        <div className={s.card}>
            <div className={s.imageWrap}>
                <AppLink href={productUrl} className={s.imageLink}>
                    {image ? (
                        <Image
                            src={image}
                            alt={title}
                            className={s.productImg}
                            width={400}
                            height={300}
                            priority
                        />
                    ) : (
                        <div className={s.imageFallback}>
                            <Image src="/icons/logo-red.svg" alt={title} width={80} height={80} />
                        </div>
                    )}
                </AppLink>
                <div className={s.overlayTop}>
                    {badge && (
                        <Badge
                            variant={badge.toLowerCase() === 'акція' || badge.toLowerCase() === 'sale' ? 'sale' : 'new'}
                            className={s.badge}
                        >
                            {badge}
                        </Badge>
                    )}
                    <WishButton productId={String(id)} className={s.favorite} />
                </div>
            </div>

            <div className={s.info}>
                <div className={s.header}>
                    <AppLink href={productUrl} className={s.titleLink}>
                        <span className={s.title}>{title}</span>
                    </AppLink>
                    <span className={s.weightList}>{displayWeight}</span>

                </div>
                
                {description && (
                    <p className={s.description}>{description}</p>
                )}

                <div className={s.footer}>
                    <div className={s.priceGroup}>
                        <div className={s.priceRow}>
                            <span className={clsx(s.price, oldPrice && oldPrice > price && s.newPrice)}>{price.toLocaleString('uk-UA')} ₴</span>
                            {oldPrice && oldPrice > price && (
                                <span className={s.oldPrice}>{oldPrice.toLocaleString('uk-UA')} ₴</span>
                            )}
                        </div>
                        <span className={s.unit}>{displayUnit}</span>

                    </div>
                    <AddToCartButton productId={String(id)} variant="full" className={s.buyBtn} hasCostVariants={hasCostVariants} />
                </div>
            </div>
        </div>
    );
}
