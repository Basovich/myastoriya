import s from "./Reviews.module.scss";
import homeData from "@/content/pages/home.json";
import SectionHeader from "../ui/SectionHeader/SectionHeader";
import Button from "../ui/Button/Button";

export default function Reviews() {
    const { reviews } = homeData;

    return (
        <section className={s.section} id="reviews">
            <SectionHeader title={reviews.sectionTitle} showArrows />
            <div className={s.carousel}>
                {reviews.items.map((review) => (
                    <div key={review.id} className={s.card}>
                        <div className={s.cardHeader}>
                            <div className={s.avatar}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                            <div className={s.author}>
                                <span className={s.name}>{review.name}</span>
                                <span className={s.date}>{review.date}</span>
                            </div>
                            <div className={s.stars}>
                                {Array.from({ length: 5 }, (_, i) => (
                                    <span key={i} className={i < review.rating ? s.starFilled : s.starEmpty}>★</span>
                                ))}
                            </div>
                        </div>
                        <p className={s.text}>{review.text}</p>
                    </div>
                ))}
            </div>
            <div className={s.cta}>
                <Button variant="outline">{reviews.leaveReviewButton}</Button>
            </div>
        </section>
    );
}
