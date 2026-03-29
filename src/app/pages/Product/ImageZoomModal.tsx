import React, { useEffect } from 'react';
import Modal from 'react-modal';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Image from 'next/image';
import { useScrollLock } from '@/hooks/useScrollLock';
import s from './ImageZoomModal.module.scss';

interface ImageZoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    images: string[];
    initialSlide?: number;
}

const ImageZoomModal: React.FC<ImageZoomModalProps> = ({ 
    isOpen, 
    onClose, 
    images, 
    initialSlide = 0 
}) => {
    const { disableScroll, enableScroll } = useScrollLock();

    useEffect(() => {
        if (isOpen) {
            disableScroll();
        } else {
            enableScroll();
        }
        return () => enableScroll();
    }, [isOpen, disableScroll, enableScroll]);

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className={s.modalWrapper}
            overlayClassName={s.overlay}
            contentLabel="Image Zoom"
            ariaHideApp={false}
        >
            <button className={s.closeBtn} onClick={onClose} aria-label="Close zoom">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M11.7625 9.99893L19.6326 2.14129C19.8678 1.90606 20 1.58701 20 1.25434C20 0.921668 19.8678 0.602622 19.6326 0.367388C19.3974 0.132153 19.0783 0 18.7457 0C18.413 0 18.0939 0.132153 17.8587 0.367388L10.0011 8.23752L2.14342 0.367388C1.90819 0.132153 1.58914 2.95361e-07 1.25647 2.97839e-07C0.9238 3.00318e-07 0.604754 0.132153 0.369519 0.367388C0.134285 0.602622 0.00213223 0.921668 0.00213223 1.25434C0.00213223 1.58701 0.134285 1.90606 0.369519 2.14129L8.23966 9.99893L0.369519 17.8566C0.252431 17.9727 0.159496 18.1109 0.0960746 18.2631C0.0326529 18.4153 0 18.5786 0 18.7435C0 18.9084 0.0326529 19.0717 0.0960746 19.224C0.159496 19.3762 0.252431 19.5143 0.369519 19.6305C0.485651 19.7476 0.623817 19.8405 0.776047 19.9039C0.928277 19.9673 1.09156 20 1.25647 20C1.42138 20 1.58467 19.9673 1.7369 19.9039C1.88913 19.8405 2.02729 19.7476 2.14342 19.6305L10.0011 11.7603L17.8587 19.6305C17.9748 19.7476 18.113 19.8405 18.2652 19.9039C18.4175 19.9673 18.5807 20 18.7457 20C18.9106 20 19.0739 19.9673 19.2261 19.9039C19.3783 19.8405 19.5165 19.7476 19.6326 19.6305C19.7497 19.5143 19.8426 19.3762 19.9061 19.224C19.9695 19.0717 20.0021 18.9084 20.0021 18.7435C20.0021 18.5786 19.9695 18.4153 19.9061 18.2631C19.8426 18.1109 19.7497 17.9727 19.6326 17.8566L11.7625 9.99893Z" fill="white" />
                </svg>
            </button>

            <Swiper
                initialSlide={initialSlide}
                spaceBetween={20}
                navigation={{
                    nextEl: `.${s.nextBtn}`,
                    prevEl: `.${s.prevBtn}`,
                }}
                pagination={{ clickable: true }}
                modules={[Navigation, Pagination]}
                className={s.slider}
            >
                {images.map((img, idx) => (
                    <SwiperSlide key={idx} className={s.slide}>
                        <div className={s.imageWrapper}>
                            <Image 
                                src={img} 
                                alt={`Zoom view ${idx + 1}`} 
                                width={1200}
                                height={800}
                                className={s.zoomImage}
                                priority={idx === initialSlide}
                            />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            <button className={s.prevBtn} aria-label="Previous">
                <svg width="22" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.1181 0.999934L1.41393 8.7041L9.1181 16.4083" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="1" y1="-1" x2="18.4783" y2="-1" transform="matrix(1 -8.74228e-08 -8.74228e-08 -1 1.79297 7.29712)" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
            </button>
            <button className={s.nextBtn} aria-label="Next">
                <svg width="22" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.1534 0.999934L19.8576 8.7041L12.1534 16.4083" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="18.4785" y1="8.29712" x2="1.00026" y2="8.29712" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
            </button>
        </Modal>
    );
};

export default ImageZoomModal;
