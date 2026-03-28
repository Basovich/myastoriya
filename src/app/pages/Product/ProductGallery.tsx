import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Image from "next/image";
import styles from './Product.module.scss';
import WishButton from '@/app/components/ui/WishButton/WishButton';

interface ProductGalleryProps {
    id: string;
    images: string[];
    discount?: string;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ id, images, discount }) => {
    return (
        <div className={styles.galleryWrapper}>
            <div className={styles.galleryInner}>
                <div className={styles.mainSliderWrapper}>
                    <Swiper
                        spaceBetween={0}
                        navigation={{
                            nextEl: `.${styles.nextBtn}`,
                            prevEl: `.${styles.prevBtn}`,
                        }}
                        pagination={{ clickable: true }}
                        modules={[Navigation, Pagination]}
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

                    <button className={styles.prevBtn} aria-label="Previous">
                    </button>
                    <button className={styles.nextBtn} aria-label="Next">
                    </button>

                    {discount && (
                        <div className={styles.discountWrapper}>
                            <span className={styles.discountBadge}>{discount}</span>
                            <span className={styles.promoText}>STEAK DAYS ЩОВІВТОРКА!</span>
                        </div>
                    )}

                    <div className={styles.galleryActions}>
                        <WishButton productId={id} className={styles.actionBtn} />
                    </div>

                    <button className={styles.zoomBtn} aria-label="Zoom">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="11" cy="11" r="8" stroke="white" strokeWidth="2"/>
                            <path d="M21 21L16.65 16.65" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M11 8V14M8 11H14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>

                    <button className={styles.videoBtn} aria-label="Play Video">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
                            <path d="M10 8L16 12L10 16V8Z" fill="white"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductGallery;
