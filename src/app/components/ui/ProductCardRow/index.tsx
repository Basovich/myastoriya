import s from './index.module.scss';
import Image from 'next/image';
import Badge from '@/app/components/ui/Badge/Badge';
import WishButton from '@/app/components/ui/WishButton/WishButton';
import AddToCartButton from '@/app/components/ui/AddToCartButton/AddToCartButton';
import AppLink from '@/app/components/ui/AppLink/AppLink';
import clsx from "clsx";


interface ProductCardRowProps {
    id: number | string;
    slug?: string;
    title: string;
    weight: string;
    price: number;
    oldPrice?: number;
    unit: string;
    badge?: string | null;
    image: string;
    description?: string;
    lang: string;
}

export default function ProductCardRow({
    id,
    slug,
    title,
    weight,
    price,
    oldPrice,
    unit,
    badge,
    image,
    description,
    lang,
}: ProductCardRowProps) {
    const isRu = lang === 'ru';
    
    const displayWeight = weight === "1" 
        ? (isRu ? "1 единица" : "1 одиниця") 
        : weight;

    const displayUnit = unit.toLowerCase() === "шт"
        ? (isRu ? "За 1 шт" : "За 1 шт")
        : `За ${unit}`;

    const productUrl = `/products/${slug || id}`;



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
                            <span className={clsx(s.price, oldPrice && s.newPrice)}>{price.toLocaleString('uk-UA')} ₴</span>
                            {oldPrice && (
                                <span className={s.oldPrice}>{oldPrice.toLocaleString('uk-UA')} ₴</span>
                            )}
                        </div>
                        <span className={s.unit}>{displayUnit}</span>

                    </div>
                    <AddToCartButton productId={String(id)} variant="full" className={s.buyBtn} />
                </div>
            </div>
        </div>
    );
}
