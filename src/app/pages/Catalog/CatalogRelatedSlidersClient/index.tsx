"use client";

import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Grid } from 'swiper/modules';
import SliderArrow from '@/app/components/ui/SliderArrow/SliderArrow';
import SectionHeader from '@/app/components/ui/SectionHeader/SectionHeader';
import s from '../CatalogContent/CatalogContent.module.scss';
// but we might need swiper css here
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/grid';

interface ProductSlideData {
    id: string | number;
    element: React.ReactNode;
}

interface CatalogRelatedSlidersProps {
    title: string;
    products: ProductSlideData[];
}

export default function CatalogRelatedSlidersClient({ title, products }: CatalogRelatedSlidersProps) {
    const [prevBtn, setPrevBtn] = useState<HTMLButtonElement | null>(null);
    const [nextBtn, setNextBtn] = useState<HTMLButtonElement | null>(null);

    if (!products || products.length === 0) return null;

    return (
        <div className={s.sliderSection}>
            <div className={s.relatedInner}>
                <div className={s.sectionHeaderRow}>
                    <SectionHeader title={title} classNameWrapper={s.sectionTitle} withDots={true} />
                    <div className={s.navArrows}>
                        <SliderArrow direction="left" ref={setPrevBtn} />
                        <SliderArrow direction="right" ref={setNextBtn} />
                    </div>
                </div>
                <div className={s.sliderContainer}>
                    <Swiper
                        modules={[Navigation, Grid]}
                        navigation={{ prevEl: prevBtn, nextEl: nextBtn }}
                        spaceBetween={12}
                        slidesPerView={2}
                        slidesPerGroup={1}
                        watchSlidesProgress={true}
                        grid={{ rows: 2, fill: 'row' }}
                        breakpoints={{
                            768: { slidesPerView: 3, slidesPerGroup: 1, grid: { rows: 1 }, spaceBetween: 16 },
                            1280: { slidesPerView: 4, slidesPerGroup: 1, grid: { rows: 1 }, spaceBetween: 20 },
                        }}
                        className={s.swiper}
                    >
                        {products.map((p, idx) => (
                            <SwiperSlide key={`${p.id}-${idx}`} className={s.slide}>
                                {p.element}
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </div>
    );
}
