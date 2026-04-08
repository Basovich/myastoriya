'use client';

import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Grid } from 'swiper/modules';
import ProductCard from '@/app/components/ui/ProductCard/ProductCard';
import SliderArrow from '@/app/components/ui/SliderArrow/SliderArrow';
import s from './RecentlyViewedSlider.module.scss';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/grid';

interface Product {
    id: number | string;
    title: string;
    weight: string;
    price: number;
    unit: string;
    badge?: string | null;
    image: string;
}

interface RecentlyViewedSliderProps {
    title: string;
    products: Product[];
}

export default function RecentlyViewedSlider({ title, products }: RecentlyViewedSliderProps) {
    const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
    const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);

    if (!products || products.length === 0) {
        return null;
    }

    return (
        <section className={s.sliderSection}>
            <div className={s.header}>
                <h3 className={s.title}>{title}</h3>
                <div className={s.navigation}>
                    <SliderArrow direction="left" ref={setPrevEl} />
                    <SliderArrow direction="right" ref={setNextEl} />
                </div>
            </div>

            <Swiper
                modules={[Navigation, Grid]}
                navigation={{ prevEl, nextEl }}
                spaceBetween={12}
                slidesPerView={2}
                slidesPerGroup={1}
                watchSlidesProgress={true}
                grid={{ rows: 2, fill: 'row' }}
                breakpoints={{
                    768: {
                        slidesPerView: 3,
                        spaceBetween: 20,
                        grid: { rows: 1 }
                    },
                    1024: {
                        slidesPerView: 4,
                        spaceBetween: 24,
                        grid: { rows: 1 }
                    }
                }}
                className={s.swiper}
            >
                {products.map((product) => (
                    <SwiperSlide key={product.id} className={s.slide}>
                        <ProductCard {...product} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
}
