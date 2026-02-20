import s from "./ProductCard.module.scss";
import Image from "next/image";
import Badge from "../Badge/Badge";
import Icon from "../Icon/Icon";

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
                <Image
                    src={image}
                    alt={title}
                    className={s.productImg}
                    width={200}
                    height={200}
                />
                {badge && (
                    <Badge
                        variant={badge === "NEW" ? "new" : "sale"}
                        className={s.badge}
                    >
                        {badge}
                    </Badge>
                )}
                <button className={s.favorite} aria-label="Додати до обраного">
                    <Icon name="favorite" width={18} height={18} />
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
                        <Icon name="plus" width={18} height={18} strokeWidth={2.5} />
                    </button>
                </div>
            </div>
        </div>
    );
}
