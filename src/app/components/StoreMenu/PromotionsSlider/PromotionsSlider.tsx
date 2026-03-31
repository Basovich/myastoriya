'use client';

import React, { useState } from 'react';
import s from './PromotionsSlider.module.scss';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import SliderArrow from '@/app/components/ui/SliderArrow/SliderArrow';
import SectionHeader from '@/app/components/ui/SectionHeader/SectionHeader';

interface Promotion {
    id: number | string;
    title: string;
    image: string;
    badge?: string;
}

interface PromotionsSliderProps {
    promotions: Promotion[];
    title?: string;
}

const PromotionsSlider: React.FC<PromotionsSliderProps> = ({ promotions, title }) => {
    const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
    const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);

    if (!promotions || promotions.length === 0) return null;

    return (
        <section className={s.wrapper}>
            <div className={s.header}>
                {title && <SectionHeader title={title} withDots={true} />}
                <div className={s.nav}>
                    <SliderArrow
                        direction="left"
                        ref={setPrevEl}
                        className={s.arrow}
                    />
                    <SliderArrow
                        direction="right"
                        ref={setNextEl}
                        className={s.arrow}
                    />
                </div>
            </div>

            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                navigation={{ prevEl, nextEl }}
                pagination={{ 
                    clickable: true,
                    el: `.${s.paginationDots}`,
                    bulletClass: s.dot,
                    bulletActiveClass: s.dotActive
                }}
                autoplay={{ delay: 5000 }}
                loop={true}
                spaceBetween={16}
                slidesPerView={1}
                className={s.swiper}
            >
                {promotions.map((promo) => (
                    <SwiperSlide key={promo.id}>
                        <div className={s.slide}>
                            <Image
                                src="/images/store/menu_promo.png"
                                alt={promo.title}
                                fill
                                className={s.promoImg}
                                priority
                            />
                            <div className={s.promoContent}>
                                {promo.badge && <span className={s.badge}>{promo.badge}</span>}
                                <h3 className={s.promoTitle}>{promo.title}</h3>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
            
            <div className={s.paginationDots}></div>
        </section>
    );
};

export default PromotionsSlider;
