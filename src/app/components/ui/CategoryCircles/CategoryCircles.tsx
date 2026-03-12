"use client";

import React, { useState } from "react";
import clsx from "clsx";
import s from "./CategoryCircles.module.scss";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import SliderArrow from "../../../components/ui/SliderArrow/SliderArrow";
import SectionHeader from "@/app/components/ui/SectionHeader/SectionHeader";

const searchCategories: CategoryCircleItem[] = [
    { name: "Сезонне меню", image: "/images/cat-grill.png", href: "#" },
    { name: "Ресторанне меню", image: "/images/cat-restaurant.png", href: "#" },
    { name: "Бургери", image: "/images/cat-burgers.png", href: "#" },
    { name: "Піца", image: "/images/cat-shashlik.png", href: "#" },
    { name: "Смакуй одразу", image: "/images/cat-sets.png", href: "#" },
    { name: "Набори для компаній", image: "/images/cat-branded.png", href: "#" },
    { name: "Гриль меню", image: "/images/cat-grill.png", href: "#" },
    { name: "Дитяче меню", image: "/images/cat-restaurant.png", href: "#" },
    { name: "Власне виробництво", image: "/images/cat-burgers.png", href: "#" },
    { name: "М'ясна продукція", image: "/images/cat-shashlik.png", href: "#" },
    { name: "Консервація", image: "/images/cat-sets.png", href: "#" },
    { name: "Сир", image: "/images/cat-branded.png", href: "#" },
];

export interface CategoryCircleItem {
    name: string;
    image: string;
    href: string;
}

interface CategoryCirclesProps {
    title?: string;
    className?: string;
    headerLeft?: React.ReactNode;
}

export default function CategoryCircles({
    title,
    className,
    headerLeft
}: CategoryCirclesProps) {
    const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
    const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);

    if (!searchCategories || searchCategories.length === 0) return null;

    return (
        <div className={clsx(s.wrapper, className)}>
            <div className={s.header}>
                {title ? (
                    <SectionHeader title={title} withDots={false} classNameWrapper={s.sectionHeaderWrapper} />
                ) : headerLeft ? (
                    headerLeft
                ) : null}
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
                    430: { slidesPerView: 4.5, spaceBetween: 10 },
                    768: { slidesPerView: 7, spaceBetween: 16 },
                    1024: { slidesPerView: 9, spaceBetween: 16 },
                    1280: { slidesPerView: 10, spaceBetween: 16 },
                    1440: { slidesPerView: 12, spaceBetween: 16 },
                }}
            >
                {searchCategories.map((item, index) => (
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
