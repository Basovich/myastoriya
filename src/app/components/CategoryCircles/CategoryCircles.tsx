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
    onHashClick?: (targetId: string) => void;
}

export default function CategoryCircles({
    title,
    className,
    withDots,
    headerLeft,
    categories = [],
    onHashClick,
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
                    768: { slidesPerView: 7, spaceBetween: 0 },
                    1024: { slidesPerView: 9, spaceBetween: 0 },
                    1280: { slidesPerView: 10, spaceBetween: 0 },
                    1440: { slidesPerView: 12, spaceBetween: 0 },
                }}
            >
                {categories.map((item, index) => {
                    const isHashLink = item.href.startsWith('#');
                    const content = (
                        <>
                            <div className={s.circle}>
                                {item.image && item.image !== "/icons/icon-category.svg" ? (
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        sizes="(max-width: 768px) 100px, 178px"
                                        className={s.circleImg}
                                    />
                                ) : (
                                    <div className={s.imageFallback}>
                                        <Image
                                            src="/icons/logo-red.svg"
                                            alt={item.name}
                                            width={36}
                                            height={36}
                                        />
                                    </div>
                                )}
                            </div>
                            <span className={s.name}>{item.name}</span>
                        </>
                    );

                    const handleHashClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                        e.preventDefault();
                        const targetId = item.href.substring(1);
                        if (onHashClick) {
                            onHashClick(targetId);
                        } else {
                            const element = document.getElementById(targetId);
                            if (element) {
                                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                        }
                    };

                    return (
                        <SwiperSlide key={index} className={s.slide}>
                            {isHashLink ? (
                                <a 
                                    href={item.href} 
                                    className={s.item} 
                                    onClick={handleHashClick}
                                >
                                    {content}
                                </a>
                            ) : (
                                <AppLink href={item.href} className={s.item}>
                                    {content}
                                </AppLink>
                            )}
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </div>
    );
}
