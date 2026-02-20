"use client";

import s from "./ComplexDiscounts.module.scss";
import SectionHeader from "../ui/SectionHeader/SectionHeader";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import Image from "next/image";
import Link from "next/link";

interface DiscountItem {
    id: number;
    title: string;
    image: string;
    dateRange: string;
    discount?: string | null;
}

interface ComplexDiscountsProps {
    dict: {
        sectionTitle: string;
        items: DiscountItem[];
    };
    lang: string;
}

export default function ComplexDiscounts({ dict, lang }: ComplexDiscountsProps) {
    if (!dict || !dict.items || dict.items.length === 0) return null;

    const getRoute = (path: string) => {
        const basePath = lang === 'ua' ? '' : `/${lang}`;
        const safePath = path.startsWith('/') ? path : `/${path}`;
        return `${basePath}${safePath}`;
    };

    return (
        <section className={s.section} id="combo">
            <div className={s.container}>
                <div className={s.headerRow}>
                    <SectionHeader title={dict.sectionTitle} align="left" />
                    <div className={s.navArrows}>
                        <button className={`combo-prev ${s.arrowBtn}`} aria-label="Previous combo">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: "rotate(180deg)" }}>
                                <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
                            </svg>
                        </button>
                        <button className={`combo-next ${s.arrowBtn}`} aria-label="Next combo">
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
                            nextEl: '.combo-next',
                            prevEl: '.combo-prev',
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
                                spaceBetween: 24
                            }
                        }}
                        className={s.swiper}
                    >
                        {dict.items.map((discount: DiscountItem) => (
                            <SwiperSlide key={discount.id} className={s.slide}>
                                <Link href={getRoute(`/complex-discounts/${discount.id}`)} className={s.cardLink}>
                                    <div className={s.card}>
                                        <div className={s.imageWrapper}>
                                            <Image src={discount.image} alt={discount.title} fill style={{ objectFit: "cover" }} />
                                        </div>
                                        <div className={s.content}>
                                            <h3 className={s.title}>{discount.title}</h3>
                                            <div className={s.bottomRow}>
                                                <span className={s.dateRange}>{discount.dateRange}</span>
                                                {discount.discount && <span className={s.discount}>{discount.discount}</span>}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </section>
    );
}
