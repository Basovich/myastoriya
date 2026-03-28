'use client';

import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import Image from "next/image";
import styles from './Product.module.scss';
import clsx from 'clsx';

interface ProductGalleryProps {
    images: string[];
    discount?: string;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ images, discount }) => {
    const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);

    return (
        <div className={styles.galleryWrapper}>
            <div className={styles.galleryInner}>
                {/* Thumbnails Slider - Desktop only side by side */}
                <div className={styles.thumbsWrapper}>
                    <Swiper
                        onSwiper={setThumbsSwiper}
                        spaceBetween={10}
                        slidesPerView={4}
                        direction="vertical"
                        watchSlidesProgress={true}
                        modules={[Navigation, Thumbs]}
                        className={styles.thumbsSlider}
                    >
                        {images.map((image, index) => (
                            <SwiperSlide key={index} className={styles.thumbSlide}>
                                <div className={styles.thumbImage}>
                                    <Image
                                        src={image}
                                        alt={`Thumbnail ${index + 1}`}
                                        width={80}
                                        height={80}
                                    />
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                {/* Main Slider */}
                <div className={styles.mainSliderWrapper}>
                    <Swiper
                        spaceBetween={0}
                        navigation={true}
                        pagination={{ clickable: true }}
                        thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                        modules={[Navigation, Pagination, Thumbs]}
                        className={styles.mainSlider}
                    >
                        {images.map((image, index) => (
                            <SwiperSlide key={index}>
                                <div className={styles.slideImage}>
                                    <Image
                                        src={image}
                                        alt={`Product image ${index + 1}`}
                                        fill
                                        priority={index === 0}
                                    />
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    {discount && <span className={styles.discountBadge}>{discount}</span>}
                </div>
            </div>
        </div>
    );
};

export default ProductGallery;
