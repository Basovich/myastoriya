"use client";

import React, { useState } from "react";
import clsx from "clsx";
import s from "./CategoryCircles.module.scss";
import Image from "next/image";
import AppLink from "@/app/components/ui/AppLink/AppLink";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import SliderArrow from "../ui/SliderArrow/SliderArrow";
import SectionHeader from "@/app/components/ui/SectionHeader/SectionHeader";

const searchCategories: CategoryCircleItem[] = [
    { name: "Сезонне меню", image: "/images/cat-grill.png", href: "/catalog/litne-menu" },
    { name: "Ресторанне меню", image: "/images/cat-restaurant.png", href: "/catalog/restoranne-menu" },
    { name: "Бургери", image: "/images/cat-burgers.png", href: "/catalog/burgery" },
    { name: "Піца", image: "/images/cat-shashlik.png", href: "/catalog/pitsa" },
    { name: "Смакуй одразу", image: "/images/cat-sets.png", href: "/catalog/vizmy-z-soboyu" },
    { name: "Набори для компаній", image: "/images/cat-branded.png", href: "/catalog/nabory-dlya-kompaniyi" },
    { name: "Гриль меню", image: "/images/cat-grill.png", href: "/catalog/gryl-menu" },
    { name: "Дитяче меню", image: "/images/cat-restaurant.png", href: "/catalog/dytyache-menu" },
    { name: "Власне виробництво", image: "/images/cat-burgers.png", href: "/catalog/vlasne-vyrobnytstvo" },
    { name: "М'ясна продукція", image: "/images/cat-shashlik.png", href: "/catalog/myasna-produktsiya" },
    { name: "Консервація", image: "/images/cat-sets.png", href: "/catalog/konservatsiya" },
    { name: "Сир", image: "/images/cat-branded.png", href: "/catalog/syry" },
];

export interface CategoryCircleItem {
    name: string;
    image: string;
    href: string;
}

interface CategoryCirclesProps {
    title?: string;
    className?: string;
    withDots?: boolean;
    headerLeft?: React.ReactNode;
    categories?: CategoryCircleItem[];
}

export default function CategoryCircles({
    title,
    className,
    withDots,
    headerLeft,
    categories = searchCategories
}: CategoryCirclesProps) {
    const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
    const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);

    if (!categories || categories.length === 0) return null;

    return (
        <div className={clsx(s.wrapper, className)}>
            <div className={s.header}>
                {title ? (
                    <SectionHeader title={title} withDots={withDots} classNameWrapper={s.sectionHeaderWrapper} />
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
                {categories.map((item, index) => (
                    <SwiperSlide key={index} className={s.slide}>
                        <AppLink href={item.href} className={s.item}>
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
                        </AppLink>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}
