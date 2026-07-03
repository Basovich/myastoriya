import s from "./ProductCard.module.scss";
import Image from "next/image";
import Badge from "../Badge/Badge";
import WishButton from "../WishButton/WishButton";
import AddToCartButton from "../AddToCartButton/AddToCartButton";
import AppLink from "../AppLink/AppLink";


interface ProductCardProps {
    id: number | string;
    slug?: string;
    title: string;
    weight: string;
    price: number;
    unit: string;
    badge?: string | null;
    image: string;
    lang: string;
    hasCostVariants?: boolean;
}

export default function ProductCard({
    id,
    slug,
    title,
    weight,
    price,
    unit,
    badge,
    image,
    lang,
    hasCostVariants = false,
}: ProductCardProps) {
    const isRu = lang === 'ru';
    const productUrl = slug ? `/products/${slug}` : `/products/${id}`;
    
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
                {displayWeight && <span className={s.weight}>{displayWeight}</span>}

            </div>
            <div className={s.info}>
                <AppLink href={productUrl}>
                    <p className={s.title}>{title}</p>
                </AppLink>
                <div className={s.priceRow}>
                    <div className={s.priceGroup}>
                        <span className={s.price}>{price.toLocaleString("uk-UA")} ₴</span>
                        <span className={s.unit}>{displayUnit}</span>

                    </div>
                    <AddToCartButton productId={String(id)} hasCostVariants={hasCostVariants} />
                </div>
            </div>
        </div>
    );
}
