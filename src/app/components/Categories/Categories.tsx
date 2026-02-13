import s from "./Categories.module.scss";
import homeData from "@/content/pages/home.json";
import SectionHeader from "../ui/SectionHeader/SectionHeader";

export default function Categories() {
    const { categories } = homeData;

    return (
        <section className={s.section} id="categories">
            <SectionHeader title={categories.sectionTitle} />
            <div className={s.grid}>
                {categories.items.map((cat, i) => (
                    <a href="#" key={i} className={s.item}>
                        <div className={s.circle}>
                            <img src={cat.image} alt={cat.title} className={s.circleImg} />
                        </div>
                        <span className={s.label}>{cat.title}</span>
                    </a>
                ))}
            </div>
        </section>
    );
}
