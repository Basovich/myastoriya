'use client';
 
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
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
    slug?: string;
    categoryId?: number | string | null;
    title: string;
    weight: string;
    price: number;
    oldPrice?: number;
    unit: string;
    badge?: string | null;
    image: string;
    description?: string;
    hasCostVariants?: boolean;
    portionSize?: string | null;
}
 
interface RelatedProductsProps {
    title: string;
    products: RelatedProduct[];
    className?: string;
    isSliderOnMobile?: boolean;
    alwaysSlider?: boolean;
}
 
const RelatedProducts: React.FC<RelatedProductsProps> = ({
    title,
    products,
    className,
    isSliderOnMobile = false,
    alwaysSlider = false,
}) => {
    const params = useParams();
    const lang = params?.lang as string || 'ua';
    const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
    const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);
    const [showArrows, setShowArrows] = useState(false);

    const handleSwiperUpdate = (swiper: { isLocked: boolean }) => {
        setShowArrows(!swiper.isLocked);
    };

    return (
        <section className={clsx(s.relatedSection, className)}>
            <div className={s.relatedHeaderRow}>
                <SectionHeader title={title} classNameWrapper={s.relatedHeader} />
                {(isSliderOnMobile || alwaysSlider) && (
                    <div 
                        className={alwaysSlider ? s.navArrowsAlways : s.navArrowsMobile}
                        style={{ display: showArrows ? 'flex' : 'none' }}
                    >
                        <SliderArrow direction="left" ref={setPrevEl} />
                        <SliderArrow direction="right" ref={setNextEl} />
                    </div>
                )}
            </div>
            
            {alwaysSlider ? (
                <div className={s.alwaysSlider}>
                    <Swiper
                        modules={[Grid, Navigation]}
                        navigation={{ prevEl, nextEl }}
                        spaceBetween={12}
                        slidesPerView={2}
                        slidesPerGroup={1}
                        watchSlidesProgress={true}
                        grid={{ rows: 2, fill: 'row' }}
                        onInit={handleSwiperUpdate}
                        onUpdate={handleSwiperUpdate}
                        onResize={handleSwiperUpdate}
                        onBreakpoint={handleSwiperUpdate}
                        breakpoints={{
                            768: {
                                slidesPerView: 3,
                                slidesPerGroup: 1,
                                grid: { rows: 2, fill: 'row' },
                                spaceBetween: 16
                            },
                            1280: {
                                slidesPerView: 4,
                                slidesPerGroup: 1,
                                grid: { rows: 1 },
                                spaceBetween: 22
                            }
                        }}
                        className={s.relatedSwiper}
                    >
                        {products.map((product) => (
                            <SwiperSlide key={product.id} className={s.slide}>
                                <ProductCard {...product} lang={lang} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            ) : (
                <>
                    <div className={isSliderOnMobile ? s.desktopGrid : ''}>
                        <div className={s.relatedGrid}>
                            {products.map((product) => (
                                <ProductCard key={product.id} {...product} lang={lang} />
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
                                onInit={handleSwiperUpdate}
                                onUpdate={handleSwiperUpdate}
                                onResize={handleSwiperUpdate}
                                onBreakpoint={handleSwiperUpdate}
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
                                        <ProductCard {...product} lang={lang} />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    )}
                </>
            )}
        </section>
    );
};
 
export default RelatedProducts;
