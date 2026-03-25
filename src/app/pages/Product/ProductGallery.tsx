'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Image from "next/image";
import styles from './Product.module.scss';

interface ProductGalleryProps {
    images: string[];
    discount?: string;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ images, discount }) => {
    return (
        <div className={styles.galleryWrapper}>
            <Swiper
                modules={[Navigation, Pagination]}
                navigation
                pagination={{ clickable: true }}
                className={styles.mainSlider}
            >
                {images.map((image, index) => (
                    <SwiperSlide key={index}>
                        <div className={styles.slideImage}>
                            <Image
                                src={image}
                                alt={`Product image ${index + 1}`}
                                width={320}
                                height={160}
                            />
                        </div>
                    </SwiperSlide>
                ))}
                {discount && <span className={styles.discountBadge}>{discount}</span>}
            </Swiper>
        </div>
    );
};

export default ProductGallery;
