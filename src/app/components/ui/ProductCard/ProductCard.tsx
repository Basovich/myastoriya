"use client";

import s from "./ProductCard.module.scss";
import Image from "next/image";
import Badge from "../Badge/Badge";
import WishButton from "../WishButton/WishButton";
import AddToCartButton from "../AddToCartButton/AddToCartButton";
import AppLink from "../AppLink/AppLink";
import clsx from "clsx";
import { useProductHref } from "@/hooks/useCategoryTree";
import { getProductFullPrice } from "@/lib/graphql";


interface ProductCardProps {
    id: number | string;
    slug?: string;
    categoryId?: number | string | null;
    title: string;
    weight: string;
    price: number;
    oldPrice?: number;
    purchaseCost?: number | null;
    purchaseOldCost?: number | null;
    unit: string;
    badge?: string | null;
    image: string;
    lang: string;
    hasCostVariants?: boolean;
    portionSize?: string | null;
    loading?: 'lazy' | 'eager';
    children?: React.ReactNode;
}

export default function ProductCard({
    id,
    slug,
    categoryId,
    title,
    price,
    oldPrice,
    purchaseCost,
    purchaseOldCost,
    unit,
    badge,
    image,
    lang,
    hasCostVariants = false,
    portionSize,
    loading = 'lazy',
    children,
}: ProductCardProps) {
    const isRu = lang === 'ru';
    const productUrl = useProductHref(slug || String(id), categoryId);

    const { fullPrice, fullOldPrice, isPricePerWeight } = getProductFullPrice({
        cost: price,
        oldCost: oldPrice,
        purchaseCost,
        purchaseOldCost,
        unit,
    });

    const displayUnit = isPricePerWeight
        ? `${price.toLocaleString("uk-UA")} ₴/${unit.replace(/\s+/g, '')}`
        : (unit.toLowerCase() === "шт"
            ? (isRu ? "За 1 шт" : "За 1 шт")
            : `За ${unit}`);

    return (


        <div className={s.card}>
            <div className={s.imageWrap}>
                <AppLink href={productUrl} className={s.productImgLink}>
                    {image ? (
                        <Image
                            src={image}
                            alt={title}
                            className={s.productImg}
                            width={162}
                            height={120}
                            loading={loading}
                        />
                    ) : (
                        <div className={s.imageFallback}>
                            <Image src="/icons/logo-red.svg" alt={title} width={40} height={40} />
                        </div>
                    )}
                </AppLink>
                {badge && (
                    <Badge
                        variant={badge === "NEW" ? "new" : "sale"}
                        className={s.badge}
                    >
                        {badge}
                    </Badge>
                )}
                <WishButton productId={String(id)} className={s.favorite} />
                {portionSize && portionSize.trim() && <span className={s.weight}>{portionSize}</span>}

            </div>
            <div className={s.info}>
                <AppLink href={productUrl}>
                    <p className={s.title}>{title}</p>
                </AppLink>
                {children}
                <div className={s.priceRow}>
                    <div className={s.priceGroup}>
                        <div className={s.priceRowInner}>
                            <span className={clsx(s.price, fullOldPrice && s.newPrice)}>
                                {fullPrice.toLocaleString("uk-UA")} ₴
                            </span>
                            {fullOldPrice && (
                                <span className={s.oldPrice}>
                                    {fullOldPrice.toLocaleString("uk-UA")} ₴
                                </span>
                            )}
                        </div>
                        <span className={clsx(s.unit, isPricePerWeight && s.unitPerWeight)}>{displayUnit}</span>

                    </div>
                    <AddToCartButton productId={String(id)} hasCostVariants={hasCostVariants} />
                </div>
            </div>
        </div>
    );
}
