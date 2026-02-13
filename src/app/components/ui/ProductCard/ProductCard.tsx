import s from "./ProductCard.module.scss";

interface ProductCardProps {
    title: string;
    weight: string;
    price: number;
    unit: string;
    badge?: string | null;
    image: string;
}

export default function ProductCard({
    title,
    weight,
    price,
    unit,
    badge,
    image,
}: ProductCardProps) {
    return (
        <div className={s.card}>
            <div className={s.imageWrap}>
                <img src={image} alt={title} className={s.productImg} />
                {badge && (
                    <span className={`${s.badge} ${badge === "NEW" ? s.badgeNew : s.badgeSale}`}>
                        {badge}
                    </span>
                )}
                <button className={s.favorite} aria-label="Додати до обраного">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                </button>
                <span className={s.weight}>{weight}</span>
            </div>
            <div className={s.info}>
                <h3 className={s.title}>{title}</h3>
                <div className={s.priceRow}>
                    <div className={s.priceGroup}>
                        <span className={s.price}>{price.toLocaleString("uk-UA")} ₴</span>
                        <span className={s.unit}>{unit}</span>
                    </div>
                    <button className={s.addBtn} aria-label="Додати до кошика">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
