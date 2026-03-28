"use client";

import { useState } from "react";
import s from "./Actions.module.scss";
import SectionHeader from "../../../components/ui/SectionHeader/SectionHeader";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import AppLink from "@/app/components/ui/AppLink/AppLink";
import Image from "next/image";
import SliderArrow from "../../../components/ui/SliderArrow/SliderArrow";

interface ActionItem {
    id: number;
    title: string;
    image: string;
    date: string;
    discount?: string | null;
}

interface ActionsProps {
    dict: {
        sectionTitle: string;
        items: ActionItem[];
    };
    lang: string;
}

export default function Actions({ dict, lang }: ActionsProps) {
    const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
    const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);

    if (!dict || !dict.items || dict.items.length === 0) return null;

    return (
        <section className={s.section} id="actions">
            <div className={s.promotionsHeader}>
                <SectionHeader title={dict.sectionTitle} />
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
                        },
                        1280: {
                            slidesPerView: 2.4,
                            spaceBetween: 20
                        }
                    }}
                    className={s.swiper}
                >
                    {dict.items.map((item, idx) => (
                        <SwiperSlide key={`${item.id}-${idx}`} className={s.slide}>
                            <AppLink href={`/actions/${item.id}`} className={s.cardLink}>
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
                                        <span className={s.date}>
                                            Акція діє до: {' '}
                                            <strong>{item.date}</strong>
                                        </span>
                                        <h4 className={s.cardTitle}>{item.title}</h4>
                                    </div>
                                </div>
                            </AppLink>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
}
