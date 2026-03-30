'use client';

import React from 'react';
import s from './StoreDetailPage.module.scss';
import { Locale } from '@/i18n/config';
import { Dictionary } from '@/i18n/types';
import Header from '@/app/components/Header/Header';
import Footer from '@/app/components/Footer/Footer';
import Breadcrumbs from '@/app/components/ui/Breadcrumbs/Breadcrumbs';
import Button from '@/app/components/ui/Button/Button';
import Image from 'next/image';
import { Store } from '@/app/components/OurStores/StoreCard/StoreCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import ImageZoomModal from '@/app/pages/Product/ImageZoomModal';
import { useState } from 'react';

interface StoreDetailPageProps {
    store: Store;
    lang: Locale;
    dict: Dictionary;
}

const StoreDetailPage: React.FC<StoreDetailPageProps> = ({ store, lang, dict }) => {
    const { ourStoresPage } = dict.home;

    const breadcrumbs = [
        { label: ourStoresPage.breadcrumbs.home, href: '/' },
        { label: ourStoresPage.breadcrumbs.stores, href: '/our-stores' },
        { label: store.name, href: '' },
    ];

    const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);

    // Use specific image for all slides as requested
    const galleryImages = [
        "/images/store/steikribai.png",
        "/images/store/steikribai.png",
        "/images/store/steikribai.png",
        "/images/store/steikribai.png",
    ];

    return (
        <>
            <Header lang={lang} />
            <main className={s.storeDetailPage}>
                <div className={s.container}>
                    <Breadcrumbs items={breadcrumbs} className={s.breadcrumbs} />

                    <section className={s.mainSection}>
                        <div className={s.gallery}>
                            <div className={s.mainSliderWrapper}>
                                <Swiper
                                    spaceBetween={0}
                                    loop={true}
                                    navigation={{
                                        nextEl: `.${s.nextBtn}`,
                                        prevEl: `.${s.prevBtn}`,
                                    }}
                                    pagination={{ clickable: true }}
                                    modules={[Navigation, Pagination]}
                                    className={s.mainSlider}
                                    onSlideChange={(swiper: SwiperType) => setActiveSlideIndex(swiper.activeIndex)}
                                >
                                    {galleryImages.map((image, index) => (
                                        <SwiperSlide key={index}>
                                            <div className={s.slideImage}>
                                                <Image 
                                                    src={image}
                                                    alt={store.name} 
                                                    fill 
                                                    priority={index === 0}
                                                />
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                                
                                <button 
                                    className={s.zoomBtn} 
                                    aria-label="Zoom"
                                    onClick={() => setIsZoomModalOpen(true)}
                                >
                                    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M25.6349 23.8081L20.8148 19.0233C22.6858 16.6887 23.5919 13.7253 23.3467 10.7426C23.1016 7.75994 21.7238 4.98461 19.4968 2.9873C17.2697 0.989992 14.3626 -0.0774791 11.3732 0.00438298C8.38384 0.086245 5.53942 1.31122 3.42482 3.42742C1.31022 5.54362 0.0861795 8.39021 0.00437965 11.3818C-0.0774202 14.3735 0.98924 17.2828 2.98503 19.5116C4.98083 21.7403 7.75405 23.1191 10.7345 23.3645C13.7149 23.6098 16.676 22.703 19.0089 20.8306L23.79 25.6154C23.9108 25.7373 24.0545 25.834 24.2128 25.9C24.3711 25.966 24.541 26 24.7125 26C24.884 26 25.0538 25.966 25.2121 25.9C25.3705 25.834 25.5141 25.7373 25.6349 25.6154C25.8691 25.373 26 25.0489 26 24.7118C26 24.3746 25.8691 24.0505 25.6349 23.8081ZM11.7202 20.8306C9.92146 20.8306 8.16312 20.2968 6.66752 19.2967C5.17192 18.2966 4.00624 16.8752 3.31789 15.2121C2.62955 13.549 2.44944 11.719 2.80036 9.95349C3.15128 8.18797 4.01745 6.56624 5.28935 5.29337C6.56126 4.0205 8.18176 3.15367 9.94594 2.80249C11.7101 2.4513 13.5387 2.63154 15.2006 3.32041C16.8624 4.00929 18.2828 5.17585 19.2821 6.67258C20.2814 8.16932 20.8148 9.929 20.8148 11.7291C20.8148 14.143 19.8566 16.458 18.1511 18.1648C16.4455 19.8717 14.1322 20.8306 11.7202 20.8306Z" fill="white"/>
                                        <path d="M16.375 10.375H12.625V6.625C12.625 6.45924 12.5592 6.30027 12.4419 6.18306C12.3247 6.06585 12.1658 6 12 6C11.8342 6 11.6753 6.06585 11.5581 6.18306C11.4408 6.30027 11.375 6.45924 11.375 6.625V10.375H7.625C7.45924 10.375 7.30027 10.4408 7.18306 10.5581C7.06585 10.6753 7 10.8342 7 11C7 11.1658 7.06585 11.3247 7.18306 11.4419C7.30027 11.5592 7.45924 11.625 7.625 11.625H11.375V15.375C11.375 15.5408 11.4408 15.6997 11.5581 15.8169C11.6753 15.9342 11.8342 16 12 16C12.1658 16 12.3247 15.9342 12.4419 15.8169C12.5592 15.6997 12.625 15.5408 12.625 15.375V11.625H16.375C16.5408 11.625 16.6997 11.5592 16.8169 11.4419C16.9342 11.3247 17 11.1658 17 11C17 10.8342 16.9342 10.6753 16.8169 10.5581C16.6997 10.4408 16.5408 10.375 16.375 10.375Z" fill="white"/>
                                    </svg>
                                </button>
                            </div>

                            <button className={s.prevBtn} aria-label="Previous"></button>
                            <button className={s.nextBtn} aria-label="Next"></button>
                        </div>

                        <div className={s.actions}>
                            <Button 
                                variant="black"
                                className={s.actionBtn}
                                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(store.address)}`, '_blank')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M11.9958 3.49304C11.9987 3.4551 11.9987 3.417 11.9958 3.37906V3.37906L10.7962 0.379426C10.7494 0.260854 10.666 0.160294 10.5581 0.0923342C10.4503 0.0243742 10.3236 -0.00745224 10.1964 0.00147186H1.79937C1.67924 0.00135554 1.56185 0.0373203 1.4624 0.104708C1.36294 0.172095 1.28601 0.2678 1.24156 0.379426L0.0419852 3.37906C0.039094 3.417 0.039094 3.4551 0.0419852 3.49304C0.0220547 3.52644 0.00786297 3.56294 0 3.60103V3.60103C0.00667601 4.01572 0.120693 4.42161 0.330931 4.77909C0.541168 5.13658 0.840448 5.43346 1.19958 5.64078V11.4001C1.19958 11.5592 1.26277 11.7118 1.37525 11.8243C1.48774 11.9368 1.64029 12 1.79937 12H10.1964C10.3555 12 10.5081 11.9368 10.6205 11.8243C10.733 11.7118 10.7962 11.5592 10.7962 11.4001V5.66478C11.1588 5.45539 11.4603 5.15473 11.6708 4.79269C11.8812 4.43064 11.9933 4.01981 11.9958 3.60103V3.60103C12.0014 3.56525 12.0014 3.52882 11.9958 3.49304V3.49304ZM6.59768 10.8001H5.3981V8.40044H6.59768V10.8001ZM9.59663 10.8001H7.79726V7.80052C7.79726 7.64141 7.73407 7.48881 7.62159 7.3763C7.5091 7.2638 7.35655 7.20059 7.19747 7.20059H4.79831C4.63924 7.20059 4.48668 7.2638 4.3742 7.3763C4.26172 7.48881 4.19853 7.64141 4.19853 7.80052V10.8001H2.39916V6.00074C2.74072 5.99881 3.07793 5.92395 3.38824 5.78118C3.69855 5.6384 3.9748 5.431 4.19853 5.17284C4.42367 5.42818 4.70055 5.63269 5.01079 5.77276C5.32103 5.91284 5.65751 5.98529 5.99789 5.98529C6.33827 5.98529 6.67476 5.91284 6.985 5.77276C7.29523 5.63269 7.57212 5.42818 7.79726 5.17284C8.02098 5.431 8.29724 5.6384 8.60755 5.78118C8.91786 5.92395 9.25507 5.99881 9.59663 6.00074V10.8001ZM9.59663 4.80088C9.27848 4.80088 8.97336 4.67447 8.7484 4.44945C8.52343 4.22444 8.39705 3.91925 8.39705 3.60103C8.39705 3.44192 8.33386 3.28933 8.22138 3.17682C8.10889 3.06431 7.95634 3.0011 7.79726 3.0011C7.63819 3.0011 7.48563 3.06431 7.37315 3.17682C7.26066 3.28933 7.19747 3.44192 7.19747 3.60103C7.19747 3.91925 7.07109 4.22444 6.84612 4.44945C6.62116 4.67447 6.31604 4.80088 5.99789 4.80088C5.67975 4.80088 5.37463 4.67447 5.14966 4.44945C4.9247 4.22444 4.79831 3.91925 4.79831 3.60103C4.79831 3.44192 4.73512 3.28933 4.62264 3.17682C4.51016 3.06431 4.3576 3.0011 4.19853 3.0011C4.03945 3.0011 3.88689 3.06431 3.77441 3.17682C3.66193 3.28933 3.59874 3.44192 3.59874 3.60103C3.60464 3.7586 3.57947 3.91579 3.52464 4.06362C3.46981 4.21145 3.38641 4.34704 3.2792 4.46263C3.17198 4.57823 3.04305 4.67157 2.89978 4.73733C2.7565 4.80308 2.60167 4.83997 2.44414 4.84588C2.12599 4.85781 1.81614 4.74284 1.58274 4.52626C1.46717 4.41903 1.37385 4.29007 1.30811 4.14676C1.24236 4.00345 1.20549 3.84859 1.19958 3.69102L2.20722 1.20132H9.78856L10.7962 3.69102C10.7735 3.99339 10.6371 4.27594 10.4146 4.48185C10.192 4.68775 9.89979 4.80174 9.59663 4.80088V4.80088Z" fill="white"/>
                                </svg>
                                Прокласти маршрут
                            </Button>
                            <Button 
                                variant="outline-black"
                                className={s.actionBtn}
                                onClick={() => window.open(store.mapUrl, '_blank')}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                    <line x1="3" y1="9" x2="21" y2="9" />
                                    <line x1="9" y1="21" x2="9" y2="9" />
                                </svg>
                                Дивитись на карті
                            </Button>
                            <Button 
                                variant="outline-black"
                                className={s.actionBtn}
                                href={`/our-stores/${store.id}/menu`}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19" />
                                </svg>
                                Переглянути меню
                            </Button>
                        </div>

                        <div className={s.infoCard}>
                            <div className={s.logoWrapper}>
                                <div className={s.logo}>M</div>
                            </div>
                            <div className={s.detailsGrid}>
                                <div className={s.detailItem}>
                                    <div className={s.icon}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                            <polyline points="22,6 12,13 2,6" />
                                        </svg>
                                    </div>
                                    <div className={s.text}>
                                        <label>E-MAIL</label>
                                        <p>{store.email}</p>
                                    </div>
                                </div>
                                <div className={s.detailItem}>
                                    <div className={s.icon}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 6 12 12 16 14" />
                                        </svg>
                                    </div>
                                    <div className={s.text}>
                                        <label>ЧАС РОБОТИ:</label>
                                        <p>{store.workingHours}</p>
                                    </div>
                                </div>
                                <div className={s.detailItem}>
                                    <div className={s.icon}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                        </svg>
                                    </div>
                                    <div className={s.text}>
                                        <label>ТЕЛЕФОН</label>
                                        <p>{store.phone}</p>
                                    </div>
                                </div>
                                <div className={s.detailItem}>
                                    <div className={s.icon}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                    </div>
                                    <div className={s.text}>
                                        <label>АДРЕСА</label>
                                        <p>{store.address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button variant="primary" className={s.googleReviewBtn}>
                            Залишити відгук на Google карті
                        </Button>

                        <div className={s.about}>
                            <h2 className={s.sectionTitle}>ПРО ЗАКЛАД</h2>
                            <p className={s.aboutText}>
                                Улюблені стейки — зі знижкою щовівторка!<br />
                                Щовівторка даруємо 20% знижки на всі стейки з нашого гриль меню. 
                                Це чудова нагода скуштувати улюблений стейк сухої чи вологої витримки 
                                або стейк від Бренд Шефа за ще приємнішою ціною. 
                                Акція діє лише офлайн у ресторанах «М'ясторія».
                            </p>
                        </div>
                    </section>
                </div>
            </main>
            <Footer lang={lang} />
            
            <ImageZoomModal
                isOpen={isZoomModalOpen}
                onClose={() => setIsZoomModalOpen(false)}
                images={galleryImages}
                initialSlide={activeSlideIndex}
            />
        </>
    );
};

export default StoreDetailPage;
