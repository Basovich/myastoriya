import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Image from "next/image";
import styles from '../Product.module.scss';
import WishButton from '@/app/components/ui/WishButton/WishButton';
import VideoModal from '@/app/components/VideoModal/VideoModal';
import ImageZoomModal from '@/app/components/ImageZoomModal/index';

interface ProductGalleryProps {
    id: string;
    images: string[];
    discount?: string;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ id, images, discount }) => {
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);

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
                        onSlideChange={(swiper: SwiperType) => setActiveSlideIndex(swiper.activeIndex)}
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

                    <button 
                        className={styles.zoomBtn} 
                        aria-label="Zoom"
                        onClick={() => setIsZoomModalOpen(true)}
                    >
                        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M25.6349 23.8081L20.8148 19.0233C22.6858 16.6887 23.5919 13.7253 23.3467 10.7426C23.1016 7.75994 21.7238 4.98461 19.4968 2.9873C17.2697 0.989992 14.3626 -0.0774791 11.3732 0.00438298C8.38384 0.086245 5.53942 1.31122 3.42482 3.42742C1.31022 5.54362 0.0861795 8.39021 0.00437965 11.3818C-0.0774202 14.3735 0.98924 17.2828 2.98503 19.5116C4.98083 21.7403 7.75405 23.1191 10.7345 23.3645C13.7149 23.6098 16.676 22.703 19.0089 20.8306L23.79 25.6154C23.9108 25.7373 24.0545 25.834 24.2128 25.9C24.3711 25.966 24.541 26 24.7125 26C24.884 26 25.0538 25.966 25.2121 25.9C25.3705 25.834 25.5141 25.7373 25.6349 25.6154C25.8691 25.373 26 25.0489 26 24.7118C26 24.3746 25.8691 24.0505 25.6349 23.8081ZM11.7202 20.8306C9.92146 20.8306 8.16312 20.2968 6.66752 19.2967C5.17192 18.2966 4.00624 16.8752 3.31789 15.2121C2.62955 13.549 2.44944 11.719 2.80036 9.95349C3.15128 8.18797 4.01745 6.56624 5.28935 5.29337C6.56126 4.0205 8.18176 3.15367 9.94594 2.80249C11.7101 2.4513 13.5387 2.63154 15.2006 3.32041C16.8624 4.00929 18.2828 5.17585 19.2821 6.67258C20.2814 8.16932 20.8148 9.929 20.8148 11.7291C20.8148 14.143 19.8566 16.458 18.1511 18.1648C16.4455 19.8717 14.1322 20.8306 11.7202 20.8306Z" fill="white"/>
                            <path d="M16.375 10.375H12.625V6.625C12.625 6.45924 12.5592 6.30027 12.4419 6.18306C12.3247 6.06585 12.1658 6 12 6C11.8342 6 11.6753 6.06585 11.5581 6.18306C11.4408 6.30027 11.375 6.45924 11.375 6.625V10.375H7.625C7.45924 10.375 7.30027 10.4408 7.18306 10.5581C7.06585 10.6753 7 10.8342 7 11C7 11.1658 7.06585 11.3247 7.18306 11.4419C7.30027 11.5592 7.45924 11.625 7.625 11.625H11.375V15.375C11.375 15.5408 11.4408 15.6997 11.5581 15.8169C11.6753 15.9342 11.8342 16 12 16C12.1658 16 12.3247 15.9342 12.4419 15.8169C12.5592 15.6997 12.625 15.5408 12.625 15.375V11.625H16.375C16.5408 11.625 16.6997 11.5592 16.8169 11.4419C16.9342 11.3247 17 11.1658 17 11C17 10.8342 16.9342 10.6753 16.8169 10.5581C16.6997 10.4408 16.5408 10.375 16.375 10.375Z" fill="white"/>
                        </svg>
                    </button>

                    <button 
                        className={styles.videoBtn} 
                        aria-label="Play Video"
                        onClick={() => setIsVideoModalOpen(true)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
                            <circle cx="20" cy="20" r="19" stroke="white" strokeWidth="2"/>
                            <path d="M25.959 17.1423L19.2669 13.1848C18.9048 12.9692 18.4938 12.8562 18.0756 12.8574C17.6575 12.8586 17.2471 12.9739 16.8861 13.1916C16.5251 13.4092 16.2265 13.7215 16.0204 14.0967C15.8144 14.472 15.7084 14.8967 15.713 15.3279V23.2715C15.713 23.9194 15.9627 24.5408 16.407 24.999C16.8513 25.4572 17.4539 25.7146 18.0823 25.7146C18.4982 25.7138 18.9067 25.6005 19.2669 25.386L25.959 21.4284C26.3186 21.2139 26.6171 20.9055 26.8247 20.5344C27.0322 20.1633 27.1415 19.7424 27.1415 19.314C27.1415 18.8856 27.0322 18.4647 26.8247 18.0935C26.6171 17.7224 26.3186 17.4141 25.959 17.1995V17.1423ZM25.2662 20.1355L18.5741 24.1501C18.4242 24.2378 18.2547 24.2839 18.0823 24.2839C17.9099 24.2839 17.7404 24.2378 17.5904 24.1501C17.4409 24.0611 17.3167 23.933 17.2303 23.7788C17.144 23.6245 17.0985 23.4496 17.0986 23.2715V15.2993C17.0985 15.1212 17.144 14.9463 17.2303 14.792C17.3167 14.6378 17.4409 14.5097 17.5904 14.4207C17.741 14.3343 17.91 14.2877 18.0823 14.2849C18.2545 14.2886 18.4232 14.3351 18.5741 14.4207L25.2662 18.4067C25.4159 18.4957 25.5401 18.6238 25.6265 18.7781C25.7129 18.9323 25.7584 19.1073 25.7584 19.2854C25.7584 19.4635 25.7129 19.6385 25.6265 19.7927C25.5401 19.947 25.4159 20.075 25.2662 20.164V20.1355Z" fill="white"/>
                        </svg>
                    </button>
                </div>
            </div>
            
            <VideoModal 
                isOpen={isVideoModalOpen} 
                onClose={() => setIsVideoModalOpen(false)} 
                videoUrl="https://www.youtube.com/watch?v=C00CfEgEPa4"
            />

            <ImageZoomModal
                isOpen={isZoomModalOpen}
                onClose={() => setIsZoomModalOpen(false)}
                images={images}
                initialSlide={activeSlideIndex}
            />
        </div>
    );
};

export default ProductGallery;
