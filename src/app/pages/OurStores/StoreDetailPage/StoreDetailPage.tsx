import React from 'react';
import s from './StoreDetailPage.module.scss';
import { Locale } from '@/i18n/config';
import { Dictionary } from '@/i18n/types';
import Breadcrumbs from '@/app/components/ui/Breadcrumbs/Breadcrumbs';
import Button from '@/app/components/ui/Button/Button';
import { Shop } from '@/lib/graphql/queries/shops';
import clsx from 'clsx';
import StoreGalleryClient from './StoreGalleryClient';

interface StoreDetailPageProps {
    shop: Shop;
    lang: Locale;
    dict: Dictionary;
}

function createGoogleMapsLink(address: string): string {
    const encoded = encodeURIComponent(address);
    return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
}

const StoreDetailPage: React.FC<StoreDetailPageProps> = ({ shop, lang, dict }) => {
    const { ourStoresPage } = dict.home;

    const match = shop.name.match(/^(.*?)\((.*?)\)$/);
    const brandName = match ? match[1].trim() : shop.name;
    const address = match ? match[2].trim() : (shop.name || '');

    const breadcrumbs = [
        { label: ourStoresPage.breadcrumbs.home, href: '/' },
        { label: ourStoresPage.breadcrumbs.stores, href: '/our-stores' },
        { label: brandName, href: '' },
    ];

    const apiImages = shop.image?.size3x || shop.image?.size2x
        ? [shop.image.size3x || shop.image.size2x || '']
        : [];
    const galleryImages = apiImages.length > 0 ? apiImages : [
        '/images/store/steikribai.png',
        '/images/store/steikribai.png',
        '/images/store/steikribai.png',
        '/images/store/steikribai.png',
    ];

    const workingHours = shop.schedule?.[0] ? `${shop.schedule[0].days}: ${shop.schedule[0].workTime}` : '';
    const phone = shop.phones?.[0] || '';

    return (
        <>
            <main className={s.storeDetailPage}>
                <div className={s.container}>
                    <Breadcrumbs items={breadcrumbs} className={s.breadcrumbs} />

                    <section className={s.mainSection}>
                        {/* Gallery — client island for Swiper + zoom */}
                        <StoreGalleryClient images={galleryImages} brandName={brandName} />

                        <div className={s.actions}>
                            <Button
                                variant="black"
                                className={s.actionBtn}
                                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`}
                                target="_blank"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M11.9958 3.49304C11.9987 3.4551 11.9987 3.417 11.9958 3.37906L10.7962 0.379426C10.7494 0.260854 10.666 0.160294 10.5581 0.0923342C10.4503 0.0243742 10.3236 -0.00745224 10.1964 0.00147186H1.79937C1.67924 0.00135554 1.56185 0.0373203 1.4624 0.104708C1.36294 0.172095 1.28601 0.2678 1.24156 0.379426L0.0419852 3.37906C0.039094 3.417 0.039094 3.4551 0.0419852 3.49304C0.0220547 3.52644 0.00786297 3.56294 0 3.60103C0.00667601 4.01572 0.120693 4.42161 0.330931 4.77909C0.541168 5.13658 0.840448 5.43346 1.19958 5.64078V11.4001C1.19958 11.5592 1.26277 11.7118 1.37525 11.8243C1.48774 11.9368 1.64029 12 1.79937 12H10.1964C10.3555 12 10.5081 11.9368 10.6205 11.8243C10.733 11.7118 10.7962 11.5592 10.7962 11.4001V5.66478C11.1588 5.45539 11.4603 5.15473 11.6708 4.79269C11.8812 4.43064 11.9933 4.01981 11.9958 3.60103C12.0014 3.56525 12.0014 3.52882 11.9958 3.49304Z" fill="white" />
                                </svg>
                                Прокласти маршрут
                            </Button>
                            <Button
                                variant="outline-black"
                                className={s.actionBtn}
                                href={createGoogleMapsLink(address)}
                                target="_blank"
                            >
                                Дивитись на карті
                            </Button>
                            <Button
                                variant="outline-black"
                                className={s.actionBtn}
                                href={`/our-stores/${shop.id}/menu`}
                            >
                                Переглянути меню
                            </Button>
                        </div>

                        <div className={s.infoCard}>
                            <div className={s.logoWrapper}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="39" height="51" viewBox="0 0 39 51" fill="none">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M29.1549 30.3686C28.3567 31.4613 25.4565 35.082 21.9053 35.4495C21.6975 35.4692 21.4911 35.4803 21.2919 35.4803C14.6938 35.4803 14.1807 24.5546 14.1807 21.2052V14.5774L14.4826 14.8583C16.5201 16.7552 16.9142 18.6863 16.8807 21.0012C16.9572 22.5057 18.021 23.1839 19.0419 23.1839C20.079 23.1839 21.2049 22.4917 21.2236 20.9719C21.2551 18.5781 21.4328 16.9722 23.635 14.8607L23.9379 14.5692V28.0378C23.9379 29.2806 24.9038 30.255 26.1358 30.255C27.3889 30.255 28.3323 29.3008 28.3323 28.0378V11.2116C28.3323 10.1342 27.5307 9.19538 26.4683 9.02896C26.3102 9.00155 26.1468 8.9876 25.9806 8.9876C23.5978 8.9876 20.5691 11.7128 19.2191 13.4313L19.0777 13.6111L18.9363 13.4303C17.6021 11.7147 14.583 8.99097 12.1619 8.99097C11.8509 8.99097 11.5557 9.03762 11.2858 9.12997C10.4245 9.42143 9.82308 10.278 9.82308 11.2116V21.4423C9.82308 22.0416 9.84075 22.6793 9.87085 23.2392C10.2659 30.5181 12.4868 39.3155 20.8185 39.886C21.0244 39.8994 21.2269 39.9062 21.4252 39.9062C23.0685 39.9062 24.5761 39.4223 26.0355 38.4262L26.635 38.0164L26.2949 38.6609C24.8967 41.3053 22.2129 45.7701 19.9576 45.9529C19.8831 45.9635 19.7967 45.9692 19.7102 45.9692C16.1551 45.9702 10.3873 36.1354 8.79457 32.3978C6.8011 27.7271 5.21225 22.3859 4.74839 18.7936L4.67339 18.2405C4.14887 14.4057 3.77005 11.6348 7.33709 9.49646C7.51671 9.38873 8.48359 8.81974 8.84808 8.63216C12.2947 6.85114 20.8648 4.36598 26.9948 4.36598C30.6803 4.36598 32.8954 5.24134 33.5771 6.96609C36.0683 12.3178 32.5352 26.1928 29.1549 30.3686ZM35.0298 1.98255C33.2302 0.667103 30.4772 0 26.8466 0C19.327 0 9.95012 2.87956 5.22941 5.6634C0.0271792 8.70264 -0.510242 13.0059 0.310938 18.9646C0.840238 22.6642 2.32543 28.6715 4.90648 34.4335C5.63738 36.0668 12.2699 50.3934 19.7895 50.3934H19.7904C19.9084 50.3934 20.0259 50.3891 20.1449 50.3829C24.3817 50.1058 28.5821 45.1312 32.6293 35.5998C34.2177 31.8839 35.5357 28.3079 36.5474 24.9699C38.3522 18.9655 40.007 10.6982 37.6361 5.39983C37.0075 3.98338 36.3783 2.96902 35.0298 1.98255Z" fill="white" />
                                </svg>
                            </div>
                            <div className={s.detailsGrid}>
                                {shop.email && (
                                    <div className={s.detailItem}>
                                        <div className={s.detailItemHeader}>
                                            <p className={s.title}>E-MAIL</p>
                                        </div>
                                        <a href={`mailto:${shop.email}`} className={s.text}>{shop.email}</a>
                                    </div>
                                )}
                                {workingHours && (
                                    <div className={s.detailItem}>
                                        <div className={s.detailItemHeader}>
                                            <p className={s.title}>ЧАС РОБОТИ:</p>
                                        </div>
                                        <p className={s.text}>{workingHours}</p>
                                    </div>
                                )}
                                {phone && (
                                    <div className={s.detailItem}>
                                        <div className={s.detailItemHeader}>
                                            <p className={s.title}>ТЕЛЕФОН</p>
                                        </div>
                                        <a href={`tel:${phone}`} className={s.text}>{phone}</a>
                                    </div>
                                )}
                                <div className={clsx(s.detailItem, s.lastItem)}>
                                    <div className={s.detailItemHeader}>
                                        <p className={s.title}>АДРЕСА</p>
                                    </div>
                                    <p className={s.text}>{address}</p>
                                </div>
                            </div>
                        </div>

                        <Button
                            variant="black"
                            href={createGoogleMapsLink(address)}
                            className={s.googleReviewBtn}
                            target="_blank"
                        >
                            Залишити відгук на Google карті
                        </Button>

                        <div className={s.about}>
                            <h2 className={s.sectionTitle}>ПРО ЗАКЛАД</h2>
                            <p className={s.aboutText}>
                                Улюблені стейки — зі знижкою щовівторка!<br />
                                Щовівторка даруємо 20% знижки на всі стейки з нашого гриль меню.
                            </p>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
};

export default StoreDetailPage;
