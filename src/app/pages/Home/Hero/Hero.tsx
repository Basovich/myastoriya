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
import Button from "../../../components/ui/Button/Button";

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
                                    <span className={s.ctaButtonInner}>{slide.ctaButton.text}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="15" viewBox="0 0 18 15" fill="none">
                                        <path d="M9.98565 0.999945L16.3141 7.32837L9.98565 13.6568" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                                        <line x1="15" y1="7.17163" x2="1" y2="7.17163" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

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
                                        <Button href={slide.ctaButton.href} variant="outline" className={s.ctaButton}>
                                            <span className={s.ctaButtonInner}>{slide.ctaButton.text}</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="15" viewBox="0 0 18 15" fill="none">
                                                <path d="M9.98565 0.999945L16.3141 7.32837L9.98565 13.6568" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                                                <line x1="15" y1="7.17163" x2="1" y2="7.17163" stroke="white" strokeWidth="2" strokeLinecap="round"/>
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
                        <path className={s.navArrowIcon} d="M16.2929 27.2929C15.9024 27.6834 15.9024 28.3166 16.2929 28.7071L22.6569 35.0711C23.0474 35.4616 23.6805 35.4616 24.0711 35.0711C24.4616 34.6805 24.4616 34.0474 24.0711 33.6569L18.4142 28L24.0711 22.3431C24.4616 21.9526 24.4616 21.3195 24.0711 20.9289C23.6805 20.5384 23.0474 20.5384 22.6569 20.9289L16.2929 27.2929ZM39 28V27L17 27V28V29L39 29V28Z" fill="white" />
                    </svg>
                </button>
                <button className={clsx(s.navArrow, s.navRight, 'hero-swiper-next')} aria-label="Наступний слайд">
                    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="28" cy="28" r="27.5" stroke="white" />
                        <path className={s.navArrowIcon} d="M16.2929 27.2929C15.9024 27.6834 15.9024 28.3166 16.2929 28.7071L22.6569 35.0711C23.0474 35.4616 23.6805 35.4616 24.0711 35.0711C24.4616 34.6805 24.4616 34.0474 24.0711 33.6569L18.4142 28L24.0711 22.3431C24.4616 21.9526 24.4616 21.3195 24.0711 20.9289C23.6805 20.5384 23.0474 20.5384 22.6569 20.9289L16.2929 27.2929ZM39 28V27L17 27V28V29L39 29V28Z" fill="white" />
                    </svg>
                </button>
            </Swiper>
        </section>
    );
}
