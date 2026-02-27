"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import clsx from "clsx";
import s from "./Categories.module.scss";
import SectionHeader from "../../../components/ui/SectionHeader/SectionHeader";
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
            <SectionHeader title={categories.sectionTitle} />

            <div className={s.sliderWrapper}>
                <Swiper
                    modules={[Navigation]}
                    navigation={{
                        prevEl,
                        nextEl,
                    }}
                    loop={false}
                    className={clsx(s.swiperContainer, "categories-swiper")}
                    breakpoints={{
                        0: { slidesPerView: 3, spaceBetween: 10 },
                        500: { slidesPerView: 4, spaceBetween: 12 },
                        768: { slidesPerView: 5, spaceBetween: 16 },
                        1024: { slidesPerView: 6, spaceBetween: 16 },
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

                <button ref={setPrevEl} className={clsx(s.navArrow, s.navLeft)} aria-label="Попередній">
                    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="28" cy="28" r="28" fill="white" />
                        <path d="M16.2929 27.2929C15.9024 27.6834 15.9024 28.3166 16.2929 28.7071L22.6569 35.0711C23.0474 35.4616 23.6805 35.4616 24.0711 35.0711C24.4616 34.6805 24.4616 34.0474 24.0711 33.6569L18.4142 28L24.0711 22.3431C24.4616 21.9526 24.4616 21.3195 24.0711 20.9289C23.6805 20.5384 23.0474 20.5384 22.6569 20.9289L16.2929 27.2929ZM39 28V27L17 27V28V29L39 29V28Z" fill="#E30613" />
                    </svg>
                </button>
                <button ref={setNextEl} className={clsx(s.navArrow, s.navRight)} aria-label="Наступний">
                    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: "rotate(180deg)" }}>
                        <circle cx="28" cy="28" r="28" fill="white" />
                        <path d="M16.2929 27.2929C15.9024 27.6834 15.9024 28.3166 16.2929 28.7071L22.6569 35.0711C23.0474 35.4616 23.6805 35.4616 24.0711 35.0711C24.4616 34.6805 24.4616 34.0474 24.0711 33.6569L18.4142 28L24.0711 22.3431C24.4616 21.9526 24.4616 21.3195 24.0711 20.9289C23.6805 20.5384 23.0474 20.5384 22.6569 20.9289L16.2929 27.2929ZM39 28V27L17 27V28V29L39 29V28Z" fill="#E30613" />
                    </svg>
                </button>
            </div>
        </section>
    );
}
