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
}: ProductCardProps) {
    const isRu = lang === 'ru';
    const productUrl = slug ? `/products/${slug}` : `/products/${id}`;
    
    const displayWeight = weight === "1" 
        ? (isRu ? "1 единица" : "1 одиниця") 
        : weight;

    const displayUnit = unit.toLowerCase() === "шт"
        ? (isRu ? "За 1 шт" : "За 1 шт")
        : `За ${unit}`;

    return (


        <div className={s.card}>
            <div className={s.imageWrap}>
                <AppLink href={productUrl} className={s.productImgLink}>
                    <Image
                        src={image}
                        alt={title}
                        className={s.productImg}
                        width={162}
                        height={120}
                    />
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
                <span className={s.weight}>{displayWeight}</span>

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
                    <AddToCartButton productId={String(id)} />
                </div>
            </div>
        </div>
    );
}
