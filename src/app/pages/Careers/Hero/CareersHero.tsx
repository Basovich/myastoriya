import s from "./CareersHero.module.scss";

interface CareersHeroProps {
    title: string;
    subtitle: string;
}

export default function CareersHero({ title, subtitle }: CareersHeroProps) {
    return (
        <section className={s.hero}>
            <div className={s.content}>
                <h1 className={s.title}>
                    {title}
                    <span className={s.subtitle}>{subtitle}</span>
                </h1>
            </div>
        </section>
    );
}
