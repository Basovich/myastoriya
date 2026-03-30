'use client';
 
import React, { useState } from 'react';
import s from '../Product.module.scss';
import clsx from 'clsx';
import SectionHeader from '@/app/components/ui/SectionHeader/SectionHeader';
import ProductCard from "@/app/components/ui/ProductCard/ProductCard";
import SliderArrow from '@/app/components/ui/SliderArrow/SliderArrow';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Grid, Navigation } from 'swiper/modules';
 
import 'swiper/css';
import 'swiper/css/grid';
import 'swiper/css/navigation';
 
interface RelatedProduct {
    id: number | string;
    title: string;
    weight: string;
    price: number;
    unit: string;
    badge?: string | null;
    image: string;
    description?: string;
}
 
interface RelatedProductsProps {
    title: string;
    products: RelatedProduct[];
    className?: string;
    isSliderOnMobile?: boolean;
}
 
const RelatedProducts: React.FC<RelatedProductsProps> = ({ title, products, className, isSliderOnMobile = false }) => {
    const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
    const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);

    return (
        <section className={clsx(s.relatedSection, className)}>
            <div className={s.relatedHeaderRow}>
                <SectionHeader title={title} classNameWrapper={s.relatedHeader} />
                {isSliderOnMobile && (
                    <div className={s.navArrowsMobile}>
                        <SliderArrow direction="left" ref={setPrevEl} />
                        <SliderArrow direction="right" ref={setNextEl} />
                    </div>
                )}
            </div>
            
            <div className={isSliderOnMobile ? s.desktopGrid : ''}>
                <div className={s.relatedGrid}>
                    {products.map((product) => (
                        <ProductCard key={product.id} {...product} />
                    ))}
                </div>
            </div>
            
            {isSliderOnMobile && (
                <div className={s.mobileSlider}>
                    <Swiper
                        modules={[Grid, Navigation]}
                        navigation={{ prevEl, nextEl }}
                        spaceBetween={12}
                        slidesPerView={2}
                        slidesPerGroup={1}
                        watchSlidesProgress={true}
                        grid={{ rows: 2, fill: 'row' }}
                        breakpoints={{
                            768: {
                                slidesPerView: 3,
                                slidesPerGroup: 1,
                                grid: { rows: 1 },
                                spaceBetween: 16
                            }
                        }}
                        className={s.relatedSwiper}
                    >
                        {products.map((product) => (
                            <SwiperSlide key={product.id} className={s.slide}>
                                <ProductCard {...product} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            )}
        </section>
    );
};
 
export default RelatedProducts;
