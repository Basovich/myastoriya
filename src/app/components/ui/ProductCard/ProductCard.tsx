import s from "./ProductCard.module.scss";
import Image from "next/image";
import Badge from "../Badge/Badge";
import WishButton from "../WishButton/WishButton";
import AddToCartButton from "../AddToCartButton/AddToCartButton";
import AppLink from "../AppLink/AppLink";
import clsx from "clsx";


interface ProductCardProps {
    id: number | string;
    slug?: string;
    title: string;
    weight: string;
    price: number;
    oldPrice?: number;
    unit: string;
    badge?: string | null;
    image: string;
    lang: string;
    hasCostVariants?: boolean;
    portionSize?: string | null;
    children?: React.ReactNode;
}

export default function ProductCard({
    id,
    slug,
    title,
    weight,
    price,
    oldPrice,
    unit,
    badge,
    image,
    lang,
    hasCostVariants = false,
    portionSize,
    children,
}: ProductCardProps) {
    const isRu = lang === 'ru';
    const productUrl = slug ? `/products/${slug}` : `/products/${id}`;
    const displayUnit = unit.toLowerCase() === "шт"
        ? (isRu ? "За 1 шт" : "За 1 шт")
        : `За ${unit}`;

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
                            <span className={clsx(s.price, oldPrice && oldPrice > price && s.newPrice)}>
                                {price.toLocaleString("uk-UA")} ₴
                            </span>
                            {oldPrice && oldPrice > price && (
                                <span className={s.oldPrice}>
                                    {oldPrice.toLocaleString("uk-UA")} ₴
                                </span>
                            )}
                        </div>
                        <span className={s.unit}>{displayUnit}</span>

                    </div>
                    <AddToCartButton productId={String(id)} hasCostVariants={hasCostVariants} />
                </div>
            </div>
        </div>
    );
}
