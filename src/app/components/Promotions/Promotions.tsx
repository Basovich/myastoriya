"use client";

import s from "./Promotions.module.scss";
import SectionHeader from "../ui/SectionHeader/SectionHeader";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import Image from "next/image";

interface PromotionItem {
    id: number;
    title: string;
    image: string;
    date: string;
    discount?: string | null;
}

interface PromotionsProps {
    dict: {
        sectionTitle: string;
        items: PromotionItem[];
    }
}

export default function Promotions({ dict }: PromotionsProps) {
    if (!dict || !dict.items || dict.items.length === 0) return null;

    return (
        <section className={s.section} id="promotions">
            <div className={s.promotionsHeader}>
                <SectionHeader title={dict.sectionTitle} />
                <div className={s.navArrows}>
                    <button className={`promo-prev ${s.arrowBtn}`} aria-label="Previous promotion">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: "rotate(180deg)" }}>
                            <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
                        </svg>
                    </button>
                    <button className={`promo-next ${s.arrowBtn}`} aria-label="Next promotion">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className={s.carouselWrapper}>
                <Swiper
                    modules={[Navigation]}
                    navigation={{
                        nextEl: '.promo-next',
                        prevEl: '.promo-prev',
                    }}
                    spaceBetween={12}
                    slidesPerView={1.2}
                    breakpoints={{
                        640: {
                            slidesPerView: 2,
                            spaceBetween: 16
                        },
                        1024: {
                            slidesPerView: 3,
                            spaceBetween: 20
                        }
                    }}
                    className={s.swiper}
                >
                    {dict.items.map((promo, idx) => (
                        <SwiperSlide key={`${promo.id}-${idx}`} className={s.card}>
                            <div className={s.cardImage}>
                                <Image src={promo.image} alt={promo.title} fill className={s.cardImg} />
                            </div>
                            <div className={s.cardMeta}>
                                <span className={s.date}>Акція діє до: <strong>{promo.date}</strong></span>
                            </div>
                            <p className={s.cardTitle}>{promo.title}</p>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
}
