"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, EffectFade, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
import s from "./Hero.module.scss";
import Image from "next/image";

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
    if (!hero || !hero.slides || hero.slides.length === 0) return null;

    return (
        <section className={s.hero} id="hero">
            <Swiper
                modules={[Navigation, Pagination, EffectFade, Autoplay]}
                effect="fade"
                navigation={{
                    prevEl: ".hero-swiper-prev",
                    nextEl: ".hero-swiper-next",
                }}
                pagination={{
                    clickable: true,
                }}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                loop={true}
                className={`${s.swiperContainer} hero-swiper`}
            >
                {hero.slides.map((slide, index) => (
                    <SwiperSlide key={index}>
                        <div className={s.slide}>
                            <Image src='/images/hero_slide_1.png'
                                   alt={`${hero.title} ${index}`}
                                   className={s.bgImage}
                                   width={320}
                                   height={555}
                            />
                            <div className={s.overlay} />
                        </div>
                    </SwiperSlide>
                ))}

                {/* Desktop navigation arrows */}
                <button className={`${s.navArrow} ${s.navLeft} hero-swiper-prev`} aria-label="Попередній слайд">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                <button className={`${s.navArrow} ${s.navRight} hero-swiper-next`} aria-label="Наступний слайд">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="9 6 15 12 9 18" />
                    </svg>
                </button>

                {/* Content Overlay */}
                <div className={s.contentOverlay}>
                    <div className={s.content}>
                        <span className={s.badge}>{hero.badge}</span>
                        <h1 className={s.title}>{hero.title}</h1>
                        <a href={hero.ctaButton.href} className={s.ctaBtn}>
                            {hero.ctaButton.text}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                            </svg>
                        </a>

                        {/* Default Pagination will render inside .swiperContainer automatically */}
                    </div>
                </div>
            </Swiper>
        </section>
    );
}
