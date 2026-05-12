"use client";

import { useState } from "react";
import s from "./ComplexDiscounts.module.scss";
import SectionHeader from "../../../components/ui/SectionHeader/SectionHeader";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import Image from "next/image";
import AppLink from "@/app/components/ui/AppLink/AppLink";
import SliderArrow from "../../../components/ui/SliderArrow/SliderArrow";
import { useMemo } from "react";
import { type Special } from "@/lib/graphql";

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
    specials?: Special[];
}

export default function ComplexDiscounts({ dict, lang, specials }: ComplexDiscountsProps) {
    const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
    const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);

    const itemsToRender = useMemo(() => {
        if (specials && specials.length > 0) {
            return specials
                .slice(0, 6)
                .map(special => {
                    let image = special.image?.size2x || special.image?.size3x || special.image?.size1x || null;
                    if (image && image.startsWith('/')) {
                        image = `https://dev-api.myastoriya.com.ua${image}`;
                    }
                    return {
                        id: parseInt(special.id),
                        slug: special.slug,
                        title: special.title || "",
                        image: image,
                        dateRange: "", 
                        discount: special.amount ? `-${special.amount}%` : null
                    };
                });
        }
        return dict?.items?.slice(0, 6) || [];
    }, [specials, dict?.items]);

    if (!dict || itemsToRender.length === 0) return null;



    return (
        <section className={s.section} id="combo">
            <div className={s.headerRow}>
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
                    slidesPerView={"auto"}
                    breakpoints={{
                        1024: {
                            spaceBetween: 20
                        },
                        1280: {
                            spaceBetween: 20
                        }
                    }}
                    className={s.swiper}
                >
                    {itemsToRender.map((discount: any, idx: number) => (
                        <SwiperSlide key={`${discount.id}-${idx}`} className={s.slide}>
                            <AppLink href={`/complex-discounts/${discount.slug || discount.id}`} className={s.cardLink}>
                                <div className={s.card}>
                                    <div className={s.cardImage}>
                                        {discount.image ? (
                                            <Image src={discount.image} alt={discount.title} fill className={s.cardImg} />
                                        ) : (
                                            <div className={s.placeholder}>
                                                <Image 
                                                    src="/icons/logo-red.svg" 
                                                    alt="Myastoriya" 
                                                    width={120} 
                                                    height={40} 
                                                    className={s.placeholderLogo} 
                                                />
                                            </div>
                                        )}
                                        {discount.discount && (
                                            <div className={s.discountBadge}>
                                                <span>{discount.discount}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className={s.cardBody}>
                                        {discount.dateRange && <span className={s.date}>{discount.dateRange}</span>}
                                        <h3 className={s.cardTitle}>{discount.title}</h3>
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
