"use client";

import { useState } from "react";
import s from "./Promotions.module.scss";
import SectionHeader from "../../../components/ui/SectionHeader/SectionHeader";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import SliderArrow from "../../../components/ui/SliderArrow/SliderArrow";

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
    const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
    const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);

    if (!dict || !dict.items || dict.items.length === 0) return null;

    const getRoute = (path: string) => {
        const basePath = lang === 'ua' ? '' : `/${lang}`;
        const safePath = path.startsWith('/') ? path : `/${path}`;
        return `${basePath}${safePath}`;
    };

    return (
        <section className={s.section} id="promotions">
            <div className={s.promotionsHeader}>
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
                            spaceBetween: 20
                        }
                    }}
                    className={s.swiper}
                >
                    {dict.items.map((item, idx) => (
                        <SwiperSlide key={`${item.id}-${idx}`} className={s.slide}>
                            <Link href={getRoute(`/promotions/${item.id}`)} className={s.cardLink}>
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
