"use client";

import { useState } from "react";
import s from "./ComplexDiscounts.module.scss";
import SectionHeader from "../../../components/ui/SectionHeader/SectionHeader";
import Container from "../../../components/ui/Container/Container";
import Icon from "../../../components/ui/Icon/Icon";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import SliderArrow from "../../../components/ui/SliderArrow/SliderArrow";

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
    const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
    const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);

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
                        <SliderArrow
                            direction="left"
                            ref={setPrevEl}
                            className={s.navArrowComp}
                        />
                        <SliderArrow
                            direction="right"
                            ref={setNextEl}
                            className={s.navArrowComp}
                        />
                    </div>
                </div>

                <div className={s.carouselWrapper}>
                    <Swiper
                        modules={[Navigation]}
                        navigation={{
                            nextEl,
                            prevEl,
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
