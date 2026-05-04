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
import { type Sale } from "@/lib/graphql";
import { useMemo } from "react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";

interface DictActionItem {
    id: number;
    title: string;
    image: string;
    date: string;
    discount?: string | null;
    slug?: string | null;
}

interface ActionsProps {
    dict: {
        sectionTitle: string;
        items: DictActionItem[];
    };
    lang: string;
    sales?: Sale[];
}

export default function Actions({ dict, lang, sales }: ActionsProps) {
    const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
    const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);

    const itemsToRender = useMemo(() => {
        if (sales && sales.length > 0) {
            return sales.map(sale => {
                // Try to extract discount from name (e.g. "-20%")
                const discountMatch = sale.name.match(/-(\d+)%/);
                const discount = discountMatch ? discountMatch[1] : null;

                // Format date
                let formattedDate = sale.expiresAt || "";
                try {
                    if (sale.expiresAt) {
                        formattedDate = format(new Date(sale.expiresAt), "dd.MM.yyyy", { locale: uk });
                    }
                } catch (e) {
                    console.error("Failed to format date:", sale.expiresAt);
                }

                return {
                    id: parseInt(sale.id),
                    title: sale.name,
                    slug: sale.slug || sale.id,
                    image: sale.image?.size2x || sale.image?.size1x || null,
                    date: formattedDate,
                    discount
                };
            });
        }
        return dict?.items?.map(item => ({
            ...item,
            slug: item.slug || item.id.toString()
        })) || [];
    }, [sales, dict?.items]);

    if (!dict || itemsToRender.length === 0) return null;

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
                    {itemsToRender.map((item, idx) => (
                        <SwiperSlide key={`${item.id}-${idx}`} className={s.slide}>
                            <AppLink href={`/actions/${item.slug}`} className={s.cardLink}>
                                <div className={s.card}>
                                    <div className={s.cardImage}>
                                        {item.image ? (
                                            <Image src={item.image} alt={item.title} fill className={s.cardImg} />
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
