"use client";

import s from "./Promotions.module.scss";
import SectionHeader from "../ui/SectionHeader/SectionHeader";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import Link from "next/link";
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
    };
    lang: string;
}

export default function Promotions({ dict, lang }: PromotionsProps) {
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
                    {dict.items.map((item, idx) => (
                        <SwiperSlide key={`${item.id}-${idx}`} className={s.slide}>
                            <Link href={`/${lang}/promotions/${item.id}`} className={s.cardLink}>
                                <div className={s.card}>
                                    <div className={s.cardImage}>
                                        <Image src={item.image} alt={item.title} fill className={s.cardImg} />
                                        {item.discount && (
                                            <div className={s.discountBadge}>
                                                -{item.discount}%
                                            </div>
                                        )}
                                    </div>
                                    <div className={s.cardBody}>
                                        <span className={s.date}>Акція діє до: {item.date}</span>
                                        <h4 className={s.cardTitle}>{item.title}</h4>
                                    </div>
                                </div>
                            </Link>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
}
