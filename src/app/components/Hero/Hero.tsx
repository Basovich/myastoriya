import s from "./Hero.module.scss";

interface HeroProps {
    hero: {
        badge: string;
        title: string;
        ctaButton: {
            text: string;
            href: string;
        };
        slides: { image: string }[];
    };
}

export default function Hero({ hero }: HeroProps) {
    return (
        <section className={s.hero} id="hero">
            <div className={s.slide}>
                <img src={hero.slides[0].image} alt={hero.title} className={s.bgImage} />
                <div className={s.overlay} />

                {/* Desktop navigation arrows */}
                <button className={s.navArrow + " " + s.navLeft} aria-label="Попередній слайд">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                <button className={s.navArrow + " " + s.navRight} aria-label="Наступний слайд">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="9 6 15 12 9 18" />
                    </svg>
                </button>

                <div className={s.content}>
                    <span className={s.badge}>{hero.badge}</span>
                    <h1 className={s.title}>{hero.title}</h1>
                    <a href={hero.ctaButton.href} className={s.ctaBtn}>
                        {hero.ctaButton.text}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                        </svg>
                    </a>
                    <div className={s.dots}>
                        <span className={s.dotActive} />
                        <span className={s.dot} />
                        <span className={s.dot} />
                        <span className={s.dot} />
                    </div>
                </div>
            </div>
        </section>
    );
}
