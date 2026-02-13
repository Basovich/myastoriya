import s from "./Publications.module.scss";
import homeData from "@/content/pages/home.json";
import SectionHeader from "../ui/SectionHeader/SectionHeader";
import Button from "../ui/Button/Button";

export default function Publications() {
    const { publications } = homeData;

    return (
        <section className={s.section} id="publications">
            <SectionHeader title={publications.sectionTitle} showArrows />
            <div className={s.carousel}>
                {publications.items.map((pub) => (
                    <a href="#" key={pub.id} className={s.card}>
                        <div className={s.imageWrap}>
                            <img src={pub.image} alt={pub.title} className={s.cardImg} />
                        </div>
                        <div className={s.info}>
                            <span className={s.date}>{pub.dateRange}</span>
                            <h3 className={s.title}>{pub.title}</h3>
                        </div>
                    </a>
                ))}
            </div>
            <div className={s.allBtn}>
                <Button variant="outline">
                    ВСІ ПУБЛІКАЦІЇ →
                </Button>
            </div>
        </section>
    );
}
