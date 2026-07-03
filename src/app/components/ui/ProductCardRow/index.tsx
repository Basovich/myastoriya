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
    hasCostVariants?: boolean;
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
    hasCostVariants = false,
}: ProductCardRowProps) {
    const isRu = lang === 'ru';
    
    // Format weight if it is just a number and not "1"
    let formattedWeight = weight;
    if (weight && weight !== "1" && /^\d+([.,]\d+)?$/.test(weight.trim())) {
        const titleLower = title.toLowerCase();
        const unitLower = unit.toLowerCase();
        const isLiquid = unitLower.includes('мл') || unitLower.includes('ml') || 
            /вино|пиво|сік|сок|вод|кола|нектар|напій|напиток|лимонад|сидр|wine|beer|juice|beverage/i.test(titleLower);
        formattedWeight = `${weight} ${isLiquid ? 'мл' : 'г'}`;
    }

    const displayWeight = formattedWeight === "1" 
        ? (isRu ? "1 единица" : "1 одиниця") 
        : formattedWeight;

    const displayUnit = unit.toLowerCase() === "шт"
        ? (isRu ? "За 1 шт" : "За 1 шт")
        : `За ${unit}`;

    const productUrl = `/products/${slug || id}`;



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
