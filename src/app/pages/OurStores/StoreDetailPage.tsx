'use client';

import React from 'react';
import s from './StoreDetailPage.module.scss';
import { Locale } from '@/i18n/config';
import { Dictionary } from '@/i18n/types';
import Header from '@/app/components/Header/Header';
import Footer from '@/app/components/Footer/Footer';
import Breadcrumbs from '@/app/components/ui/Breadcrumbs/Breadcrumbs';
import Button from '@/app/components/ui/Button/Button';
import Link from 'next/link';
import Image from 'next/image';
import { Store } from '@/app/components/OurStores/StoreCard/StoreCard';

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

    // Mock additional images for the gallery since stores.json only has one
    const galleryImages = [
        store.image,
        store.image,
        store.image,
        store.image,
        store.image,
    ];

    return (
        <>
            <Header lang={lang} />
            <main className={s.storeDetailPage}>
                <div className={s.container}>
                    <Breadcrumbs items={breadcrumbs} className={s.breadcrumbs} />

                    <section className={s.mainSection}>
                        <div className={s.gallery}>
                            <div className={s.mainImageWrapper}>
                                <Image 
                                    src={store.image} 
                                    alt={store.name} 
                                    fill 
                                    className={s.mainImage}
                                    priority
                                />
                                <button className={s.zoomBtn}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
                                        <path d="M20 20L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                        <path d="M11 8V14M8 11H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                </button>
                                
                                <button className={`${s.navBtn} ${s.prevBtn}`}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                                        <polyline points="15 18 9 12 15 6" />
                                    </svg>
                                </button>
                                <button className={`${s.navBtn} ${s.nextBtn}`}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </button>
                            </div>
                            <div className={s.dots}>
                                {galleryImages.map((_, i) => (
                                    <span key={i} className={`${s.dot} ${i === 0 ? s.active : ''}`} />
                                ))}
                            </div>
                        </div>

                        <div className={s.actions}>
                            <Button 
                                variant="primary" 
                                className={s.actionBtn}
                                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(store.address)}`, '_blank')}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                Прокласти маршрут
                            </Button>
                            <Button 
                                variant="outline" 
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
                                variant="outline" 
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
        </>
    );
};

export default StoreDetailPage;
