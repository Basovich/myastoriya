"use client";

import s from "./ComplexDiscounts.module.scss";
import SectionHeader from "../ui/SectionHeader/SectionHeader";
import Container from "../ui/Container/Container";
import Icon from "../ui/Icon/Icon";
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
            <Container>
                <div className={s.headerRow}>
                    <SectionHeader title={dict.sectionTitle} align="left" />
                    <div className={s.navArrows}>
                        <button className={`combo-prev ${s.arrowBtn}`} aria-label="Previous combo">
                            <Icon name="arrow-right" style={{ transform: "rotate(180deg)" }} />
                        </button>
                        <button className={`combo-next ${s.arrowBtn}`} aria-label="Next combo">
                            <Icon name="arrow-right" />
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
                                        <div className={s.cardImage}>
                                            <Image src={discount.image} alt={discount.title} fill className={s.cardImg} />
                                            {discount.discount && (
                                                <div className={s.discountBadge}>
                                                    <span>{discount.discount}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className={s.cardBody}>
                                            <span className={s.date}>{discount.dateRange}</span>
                                            <h3 className={s.cardTitle}>{discount.title}</h3>
                                        </div>
                                    </div>
                                </Link>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </Container>
        </section>
    );
}
