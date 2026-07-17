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
import AppLink from "../../../components/ui/AppLink/AppLink";
import type { PopularCategory } from "@/lib/graphql";
import { Locale } from "@/i18n/config";

interface CategoriesProps {
    lang: Locale;
    popularCategories: PopularCategory[];
    categoryHrefs: Record<string, string>;
}

export default function Categories({ lang, popularCategories, categoryHrefs }: CategoriesProps) {
    const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
    const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);

    if (!popularCategories) return null;

    const sectionTitle = lang === "ua" ? "КАТЕГОРІЇ" : "КАТЕГОРИИ";

    return (
        <section className={s.section} id="categories">
            <SectionHeader title={sectionTitle} classNameWrapper={s.classNameWrapper} />

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
                    {popularCategories.map((cat) => {
                        const imageUrl = (() => {
                            const thumb = cat.thumbnail?.thumb3x || cat.thumbnail?.thumb2x || cat.thumbnail?.thumb1x;
                            if (thumb) {
                                return thumb.startsWith("/") ? `https://dev-api.myastoriya.com.ua${thumb}` : thumb;
                            }
                            const img = cat.image?.square2x || cat.image?.big2x || cat.image?.square1x || cat.image?.big1x;
                            if (img) {
                                return img.startsWith("/") ? `https://dev-api.myastoriya.com.ua${img}` : img;
                            }
                            return null;
                        })();

                        return (
                            <SwiperSlide key={cat.id} className={s.slide}>
                                <AppLink href={categoryHrefs[cat.id] ?? `/${cat.slug ?? cat.id}`} className={s.item}>
                                    <div className={s.circle}>
                                        {imageUrl ? (
                                            <Image
                                                src={imageUrl}
                                                alt={cat.name}
                                                width={180}
                                                height={180}
                                                className={s.circleImg}
                                            />
                                        ) : (
                                            <div className={s.placeholder}>
                                                <Image 
                                                    src="/icons/logo-red.svg" 
                                                    alt="" 
                                                    width={60} 
                                                    height={60} 
                                                    className={s.placeholderLogo}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <span className={s.label}>{cat.name}</span>
                                </AppLink>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
            </div>
        </section>
    );
}
