import s from "./Promotions.module.scss";
import homeData from "@/content/pages/home.json";
import SectionHeader from "../ui/SectionHeader/SectionHeader";

export default function Promotions() {
    const { promotions } = homeData;

    return (
        <section className={s.section} id="promotions">
            <SectionHeader title={promotions.sectionTitle} showArrows />
            <div className={s.carousel}>
                {promotions.items.map((promo) => (
                    <div key={promo.id} className={s.card}>
                        <div className={s.cardImage}>
                            <img src={promo.image} alt={promo.title} className={s.cardImg} />
                            <div className={s.cardOverlay}>
                                {promo.discount && (
                                    <div className={s.discountBadge}>
                                        <span className={s.discountLabel}>ДАРИМО СКИДКУ</span>
                                        <span className={s.discountValue}>{promo.discount}<sub>грн</sub></span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={s.cardMeta}>
                            <span className={s.date}>Акція дії до: <strong>{promo.date}</strong></span>
                        </div>
                        <p className={s.cardTitle}>{promo.title}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
