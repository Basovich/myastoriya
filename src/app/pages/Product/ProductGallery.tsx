import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Image from "next/image";
import styles from './Product.module.scss';
import WishButton from '@/app/components/ui/WishButton/WishButton';
import VideoModal from '@/app/components/VideoModal/VideoModal';

interface ProductGalleryProps {
    id: string;
    images: string[];
    discount?: string;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ id, images, discount }) => {
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

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
        </div>
    );
};

export default ProductGallery;
