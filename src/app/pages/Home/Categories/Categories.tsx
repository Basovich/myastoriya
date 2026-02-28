"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import clsx from "clsx";
import s from "./Categories.module.scss";
import SectionHeader from "../../../components/ui/SectionHeader/SectionHeader";
import SliderArrow from "../../../components/ui/SliderArrow/SliderArrow";
import Image from "next/image";

interface Category {
    title: string;
    image: string;
}

interface CategoriesProps {
    categories: {
        sectionTitle: string;
        items: Category[];
    };
}

export default function Categories({ categories }: CategoriesProps) {
    const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
    const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);

    if (!categories || !categories.items) return null;

    return (
        <section className={s.section} id="categories">
            <SectionHeader title={categories.sectionTitle} classNameDots={s.classNameWrapper} />

            <div className={s.sliderWrapper}>
                <div className={s.sliderNav}>
                    <SliderArrow
                        direction="left"
                        className={s.navArrow}
                        onClick={() => { }}
                        ariaLabel="Попередній"
                        ref={setPrevEl}
                    />
                    <SliderArrow
                        direction="right"
                        className={s.navArrow}
                        onClick={() => { }}
                        ariaLabel="Наступний"
                        ref={setNextEl}
                    />
                </div>
                <Swiper
                    modules={[Navigation]}
                    navigation={{
                        prevEl,
                        nextEl,
                    }}
                    loop={false}
                    className={clsx(s.swiperContainer, "categories-swiper")}
                    breakpoints={{
                        0: { slidesPerView: 3.6, spaceBetween: 10 },
                        600: { slidesPerView: 5, spaceBetween: 16 },
                        1024: { slidesPerView: 6, spaceBetween: 16 },
                        1280: { slidesPerView: 6, spaceBetween: 0 },
                    }}
                >
                    {categories.items.map((cat, i) => (
                        <SwiperSlide key={i} className={s.slide}>
                            <a href="#" className={s.item}>
                                <div className={s.circle}>
                                    <Image src={cat.image} alt={cat.title} width={100} height={100} className={s.circleImg} />
                                </div>
                                <span className={s.label}>{cat.title}</span>
                            </a>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
}
