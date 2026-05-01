"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
import clsx from "clsx";
import s from "./Hero.module.scss";
import Image from "next/image";
import AppLink from "../../../components/ui/AppLink/AppLink";
import Button from "../../../components/ui/Button/Button";
import type { Slide } from "@/lib/graphql";
import { type Locale } from "@/i18n/config";

interface HeroProps {
    slides: Slide[];
    lang: Locale;
}

export default function Hero({ slides, lang }: HeroProps) {
    if (!slides || slides.length === 0) return null;

    const btnText = lang === 'ua' ? 'Дізнатися більше' : 'Узнать больше';

    // Helper to generate correct link from linkTo
    const getLink = (linkTo: Slide['linkTo']) => {
        if (!linkTo || !linkTo.type) return "/actions";
        
        const identifier = linkTo.slug || linkTo.id;
        if (!identifier) return "/actions";

        if (linkTo.type === "product") return `/products/${identifier}`;
        if (linkTo.type === "category") return `/catalog/${identifier}`;
        if (linkTo.type === "page") return `/${identifier}`;
        return `/actions/${identifier}`; // Default fallback for actions/sales
    };

    if (slides.length === 1) {
        const slide = slides[0];
        const imageUrl = slide.imageWeb?.desktop || slide.image?.size3x || slide.image?.size2x || '';
        const href = getLink(slide.linkTo);

        return (
            <section className={s.hero} id="hero">
                <div className={s.singleSlide}>
                    <div className={s.slide}>
                        {imageUrl && (
                            <Image
                                src={imageUrl}
                                alt={slide.name || "Слайд"}
                                className={s.bgImage}
                                width={1920}
                                height={555}
                                priority
                            />
                        )}
                        <div className={s.overlay} />
                        
                        <div className={s.contentOverlay}>
                            <div className={s.content}>
                                <AppLink href={href}>
                                    <h1 className={s.title}>{slide.name}</h1>
                                </AppLink>
                                <Button href={href} variant="outline" className={s.ctaButton}>
                                    <span className={s.ctaButtonInner}>{btnText}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="15" viewBox="0 0 18 15" fill="none">
                                        <path d="M9.98565 0.999945L16.3141 7.32837L9.98565 13.6568" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                                        <line x1="15" y1="7.17163" x2="1" y2="7.17163" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                </Button>
                            </div>
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
                {slides.map((slide, index) => {
                    const imageUrl = slide.imageWeb?.desktop || slide.image?.size3x || slide.image?.size2x || '';
                    const slideHref = getLink(slide.linkTo);

                    return (
                        <SwiperSlide key={slide.id || index}>
                            <div className={s.slide}>
                                {imageUrl && (
                                    <Image
                                        src={imageUrl}
                                        alt={slide.name || "Слайд"}
                                        className={s.bgImage}
                                        width={1920}
                                        height={555}
                                        priority={index === 0}
                                    />
                                )}
                                <div className={s.overlay} />

                                <div className={s.contentOverlay}>
                                    <div className={s.content}>
                                        <AppLink href={slideHref}>
                                            <h2 className={s.title}>{slide.name}</h2>
                                        </AppLink>
                                        <Button href={slideHref} variant="outline" className={s.ctaButton}>
                                            <span className={s.ctaButtonInner}>{btnText}</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="15" viewBox="0 0 18 15" fill="none">
                                                <path d="M9.98565 0.999945L16.3141 7.32837L9.98565 13.6568" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                                                <line x1="15" y1="7.17163" x2="1" y2="7.17163" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                                            </svg>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    );
                })}

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
