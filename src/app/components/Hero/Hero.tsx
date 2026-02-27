"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, EffectFade, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
import clsx from "clsx";
import s from "./Hero.module.scss";
import Image from "next/image";
import Button from "../ui/Button/Button";

interface SlideContent {
    image: string;
    badge: string;
    title: string;
    ctaButton: {
        text: string;
        href: string;
    };
}

interface HeroProps {
    hero: {
        slides: SlideContent[];
    };
}

export default function Hero({ hero }: HeroProps) {
    if (!hero || !hero.slides || hero.slides.length === 0) return null;

    if (hero.slides.length === 1) {
        const slide = hero.slides[0];
        return (
            <section className={s.hero} id="hero">
                <div className={s.singleSlide}>
                    <div className={s.slide}>
                        <Image
                            src={slide.image}
                            alt={slide.title}
                            className={s.bgImage}
                            width={320}
                            height={555}
                            priority
                        />
                        <div className={s.overlay} />
                    </div>
                    <div className={s.contentOverlay}>
                        <div className={s.content}>
                            <span className={s.badge}>{slide.badge}</span>
                            <h1 className={s.title}>{slide.title}</h1>
                            {slide.ctaButton && (
                                <Button href={slide.ctaButton.href} variant="outline" className={s.ctaButton}>
                                    {slide.ctaButton.text}
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                        <polyline points="12 5 19 12 12 19" />
                                    </svg>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // Множество слайдів — рендерим слайдер
    return (
        <section className={s.hero} id="hero">
            <Swiper
                modules={[Navigation, Pagination, EffectFade]}
                effect="fade"
                navigation={{
                    prevEl: ".hero-swiper-prev",
                    nextEl: ".hero-swiper-next",
                }}
                pagination={{
                    clickable: true,
                }}
                loop={true}
                className={clsx(s.swiperContainer, "hero-swiper")}
            >
                {hero.slides.map((slide, index) => (
                    <SwiperSlide key={index}>
                        <div className={s.slide}>
                            <Image
                                src={slide.image}
                                alt={slide.title}
                                className={s.bgImage}
                                width={320}
                                height={555}
                                priority={index === 0}
                            />
                            <div className={s.overlay} />

                            {/* Content Overlay всередину кожного слайду */}
                            <div className={s.contentOverlay}>
                                <div className={s.content}>
                                    <span className={s.badge}>{slide.badge}</span>
                                    <h1 className={s.title}>{slide.title}</h1>
                                    {slide.ctaButton && (
                                        <Button href={slide.ctaButton.href} variant="outline">
                                            {slide.ctaButton.text}
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <line x1="5" y1="12" x2="19" y2="12" />
                                                <polyline points="12 5 19 12 12 19" />
                                            </svg>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}

                {/* Desktop navigation arrows */}
                <button className={clsx(s.navArrow, s.navLeft, 'hero-swiper-prev')} aria-label="Попередній слайд">
                    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="28" cy="28" r="27.5" stroke="white" />
                        <path d="M16.2929 27.2929C15.9024 27.6834 15.9024 28.3166 16.2929 28.7071L22.6569 35.0711C23.0474 35.4616 23.6805 35.4616 24.0711 35.0711C24.4616 34.6805 24.4616 34.0474 24.0711 33.6569L18.4142 28L24.0711 22.3431C24.4616 21.9526 24.4616 21.3195 24.0711 20.9289C23.6805 20.5384 23.0474 20.5384 22.6569 20.9289L16.2929 27.2929ZM39 28V27L17 27V28V29L39 29V28Z" fill="white" />
                    </svg>
                </button>
                <button className={clsx(s.navArrow, s.navRight, 'hero-swiper-next')} aria-label="Наступний слайд">
                    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_2179_1184)">
                            <path d="M28 0.5C12.8122 0.5 0.5 12.8122 0.5 28C0.5 43.1878 12.8122 55.5 28 55.5C43.1878 55.5 55.5 43.1878 55.5 28C55.5 12.8122 43.1878 0.5 28 0.5Z" stroke="white" />
                            <path d="M39.7071 28.7071C40.0976 28.3166 40.0976 27.6834 39.7071 27.2929L33.3431 20.9289C32.9526 20.5384 32.3195 20.5384 31.9289 20.9289C31.5384 21.3195 31.5384 21.9526 31.9289 22.3431L37.5858 28L31.9289 33.6569C31.5384 34.0474 31.5384 34.6805 31.9289 35.0711C32.3195 35.4616 32.9526 35.4616 33.3431 35.0711L39.7071 28.7071ZM17 28V29L39 29V28V27L17 27V28Z" fill="white" />
                        </g>
                        <defs>
                            <clipPath id="clip0_2179_1184">
                                <rect width="56" height="56" fill="white" transform="matrix(-1 0 0 -1 56 56)" />
                            </clipPath>
                        </defs>
                    </svg>
                </button>
            </Swiper>
        </section>
    );
}
