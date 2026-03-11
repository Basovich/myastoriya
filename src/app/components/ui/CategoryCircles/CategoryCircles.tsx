"use client";

import { useState } from "react";
import clsx from "clsx";
import s from "./CategoryCircles.module.scss";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import SliderArrow from "../SliderArrow/SliderArrow";
import SectionHeader from "../SectionHeader/SectionHeader";

export interface CategoryCircleItem {
    name: string;
    image: string;
    href: string;
}

interface CategoryCirclesProps {
    title?: string;
    items: CategoryCircleItem[];
    className?: string;
}

export default function CategoryCircles({
    title,
    items,
    className
}: CategoryCirclesProps) {
    const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
    const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);

    if (!items || items.length === 0) return null;

    return (
        <div className={clsx(s.wrapper, className)}>
            <div className={s.header}>
                {title && <SectionHeader title={title} withDots={false} classNameWrapper={s.sectionHeaderWrapper} />}

                <div className={s.sliderNav}>
                    <SliderArrow
                        direction="left"
                        className={s.navArrow}
                        onClick={() => {}}
                        ariaLabel="Попередній"
                        ref={setPrevEl}
                    />
                    <SliderArrow
                        direction="right"
                        className={s.navArrow}
                        onClick={() => {}}
                        ariaLabel="Наступний"
                        ref={setNextEl}
                    />
                </div>
            </div>

            <Swiper
                modules={[Navigation]}
                navigation={{ prevEl, nextEl }}
                loop={false}
                className={s.swiperContainer}
                breakpoints={{
                    0: { slidesPerView: 3.5, spaceBetween: 10 },
                    600: { slidesPerView: 4.5, spaceBetween: 16 },
                    1024: { slidesPerView: 6, spaceBetween: 16 },
                    1280: { slidesPerView: 6, spaceBetween: 24 },
                }}
            >
                {items.map((item, index) => (
                    <SwiperSlide key={index} className={s.slide}>
                        <Link href={item.href} className={s.item}>
                            <div className={s.circle}>
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    sizes="(max-width: 768px) 100px, 178px"
                                    className={s.circleImg}
                                />
                            </div>
                            <span className={s.name}>{item.name}</span>
                        </Link>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}
