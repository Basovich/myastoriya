import React from 'react';
import s from './StoreDetailPage.module.scss';
import { Locale } from '@/i18n/config';
import { Dictionary } from '@/i18n/types';
import Breadcrumbs from '@/app/components/ui/Breadcrumbs/Breadcrumbs';
import Button from '@/app/components/ui/Button/Button';
import { Shop } from '@/lib/graphql/queries/shops';
import clsx from 'clsx';
import StoreGalleryClient from './StoreGalleryClient';
import GeocodedAddressClient from '@/app/components/ui/GeocodedAddress/GeocodedAddressClient';

const LOCALIZED_TEXTS = {
    ua: {
        buildRoute: "Прокласти маршрут",
        viewOnMap: "Дивитись на карті",
        viewMenu: "Переглянути меню",
        email: "E-MAIL",
        workingHours: "ЧАС РОБОТИ:",
        phone: "ТЕЛЕФОН",
        address: "АДРЕСА",
        leaveReview: "Залишити відгук на Google карті",
        aboutStore: "ПРО ЗАКЛАД",
        defaultDescLine1: "Улюблені стейки — зі знижкою щовівторка!",
        defaultDescLine2: "Щовівторка даруємо 20% знижки на всі стейки з нашого гриль меню."
    },
    ru: {
        buildRoute: "Проложить маршрут",
        viewOnMap: "Смотреть на карте",
        viewMenu: "Посмотреть меню",
        email: "E-MAIL",
        workingHours: "ВРЕМЯ РАБОТЫ:",
        phone: "ТЕЛЕФОН",
        address: "АДРЕС",
        leaveReview: "Оставить отзыв на Google карте",
        aboutStore: "О ЗАВЕДЕНИИ",
        defaultDescLine1: "Любимые стейки — со скидкой каждый вторник!",
        defaultDescLine2: "Каждый вторник дарим 20% скидки на все стейки из нашего гриль меню."
    }
};

interface StoreDetailPageProps {
    shop: Shop;
    lang: Locale;
    dict: Dictionary;
}

function createGoogleMapsLink(lat: number | null | undefined, lng: number | null | undefined, address: string): string {
    if (lat !== null && lat !== undefined && lng !== null && lng !== undefined) {
        return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }
    const encoded = encodeURIComponent(address);
    return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
}

function groupSchedule(schedule: Shop["schedule"]) {
    if (!schedule || schedule.length === 0) return [];

    const groups: { days: string[]; workTime: string }[] = [];

    schedule.forEach((item) => {
        const lastGroup = groups[groups.length - 1];
        if (lastGroup && lastGroup.workTime === item.workTime) {
            lastGroup.days.push(item.days);
        } else {
            groups.push({ days: [item.days], workTime: item.workTime });
        }
    });

    return groups.map(group => {
        if (group.days.length === 1) return `${group.days[0]}: ${group.workTime}`;
        return `${group.days[0]} - ${group.days[group.days.length - 1]}: ${group.workTime}`;
    });
}

const StoreDetailPage: React.FC<StoreDetailPageProps> = ({ shop, lang, dict }) => {
    const { ourStoresPage } = dict.home;
    const texts = LOCALIZED_TEXTS[lang] || LOCALIZED_TEXTS.ua;

    const match = shop.name.match(/^(.*?)\((.*?)\)$/);
    const brandName = shop.siteName || (match ? match[1].trim() : shop.name);
    const address = shop.siteAddress || (match ? match[2].trim() : (shop.name || ''));

    const breadcrumbs = [
        { label: ourStoresPage.breadcrumbs.home, href: '/' },
        { label: ourStoresPage.breadcrumbs.stores, href: '/our-stores' },
        { label: brandName, href: '' },
    ];

    const apiImages = (shop.images && shop.images.length > 0)
        ? shop.images.map(img => img.url.size3x || img.url.size2x || img.url.size1x || '')
        : (shop.image?.size3x || shop.image?.size2x || shop.image?.size1x)
            ? [shop.image.size3x || shop.image.size2x || shop.image.size1x || '']
            : [];
            
    const galleryImages = apiImages.length > 0 ? apiImages : [
        '/images/store/steikribai.png',
        '/images/store/steikribai.png',
        '/images/store/steikribai.png',
        '/images/store/steikribai.png',
    ];

    const groupedSchedule = groupSchedule(shop.schedule);
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
                                href={shop.lat !== null && shop.lat !== undefined && shop.lng !== null && shop.lng !== undefined
                                    ? `https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}`
                                    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
                                }
                                target="_blank"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M11.9958 3.49304C11.9987 3.4551 11.9987 3.417 11.9958 3.37906L10.7962 0.379426C10.7494 0.260854 10.666 0.160294 10.5581 0.0923342C10.4503 0.0243742 10.3236 -0.00745224 10.1964 0.00147186H1.79937C1.67924 0.00135554 1.56185 0.0373203 1.4624 0.104708C1.36294 0.172095 1.28601 0.2678 1.24156 0.379426L0.0419852 3.37906C0.039094 3.417 0.039094 3.4551 0.0419852 3.49304C0.0220547 3.52644 0.00786297 3.56294 0 3.60103C0.00667601 4.01572 0.120693 4.42161 0.330931 4.77909C0.541168 5.13658 0.840448 5.43346 1.19958 5.64078V11.4001C1.19958 11.5592 1.26277 11.7118 1.37525 11.8243C1.48774 11.9368 1.64029 12 1.79937 12H10.1964C10.3555 12 10.5081 11.9368 10.6205 11.8243C10.733 11.7118 10.7962 11.5592 10.7962 11.4001V5.66478C11.1588 5.45539 11.4603 5.15473 11.6708 4.79269C11.8812 4.43064 11.9933 4.01981 11.9958 3.60103C12.0014 3.56525 12.0014 3.52882 11.9958 3.49304ZM6.59768 10.8001H5.3981V8.40044H6.59768V10.8001ZM9.59663 10.8001H7.79726V7.80052C7.79726 7.64141 7.73407 7.48881 7.62159 7.3763C7.5091 7.2638 7.35655 7.20059 7.19747 7.20059H4.79831C4.63924 7.20059 4.48668 7.2638 4.3742 7.3763C4.26172 7.48881 4.19853 7.64141 4.19853 7.80052V10.8001H2.39916V6.00074C2.74072 5.99881 3.07793 5.92395 3.38824 5.78118C3.69855 5.6384 3.9748 5.431 4.19853 5.17284C4.42367 5.42818 4.70055 5.63269 5.01079 5.77276C5.32103 5.91284 5.65751 5.98529 5.99789 5.98529C6.33827 5.98529 6.67476 5.91284 6.985 5.77276C7.29523 5.63269 7.57212 5.42818 7.79726 5.17284C8.02098 5.431 8.29724 5.6384 8.60755 5.78118C8.91786 5.92395 9.25507 5.99881 9.59663 6.00074V10.8001ZM9.59663 4.80088C9.27848 4.80088 8.97336 4.67447 8.7484 4.44945C8.52343 4.22444 8.39705 3.91925 8.39705 3.60103C8.39705 3.44192 8.33386 3.28933 8.22138 3.17682C8.10889 3.06431 7.95634 3.0011 7.79726 3.0011C7.63819 3.0011 7.48563 3.06431 7.37315 3.17682C7.26066 3.28933 7.19747 3.44192 7.19747 3.60103C7.19747 3.91925 7.07109 4.22444 6.84612 4.44945C6.62116 4.67447 6.31604 4.80088 5.99789 4.80088C5.67975 4.80088 5.37463 4.67447 5.14966 4.44945C4.9247 4.22444 4.79831 3.91925 4.79831 3.60103C4.79831 3.44192 4.73512 3.28933 4.62264 3.17682C4.51016 3.06431 4.3576 3.0011 4.19853 3.0011C4.03945 3.0011 3.88689 3.06431 3.77441 3.17682C3.66193 3.28933 3.59874 3.44192 3.59874 3.60103C3.60464 3.7586 3.57946 3.91579 3.52464 4.06362C3.46981 4.21145 3.38641 4.34704 3.2792 4.46263C3.17198 4.57823 3.04306 4.67157 2.89978 4.73733C2.7565 4.80308 2.60167 4.83997 2.44414 4.84588C2.12599 4.85781 1.81614 4.74284 1.58274 4.52626C1.46717 4.41903 1.37385 4.29007 1.30811 4.14676C1.24236 4.00345 1.20549 3.84859 1.19958 3.69102L2.20722 1.20132H9.78856L10.7962 3.69102C10.7735 3.99339 10.6371 4.27594 10.4146 4.48185C10.192 4.68775 9.89979 4.80174 9.59663 4.80088Z" fill="white"/>
                                </svg>
                                {texts.buildRoute}
                            </Button>
                            <Button
                                variant="outline-black"
                                className={s.actionBtn}
                                href={createGoogleMapsLink(shop.lat, shop.lng, address)}
                                target="_blank"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="11" viewBox="0 0 14 11" fill="none">
                                    <path d="M13.524 1.25219L9.324 0.0307193H9.275C9.24241 0.027862 9.20958 0.027862 9.177 0.0307193H9.016H8.925H8.876L4.9 1.22165L0.924002 0.0307193C0.818733 0.000433876 0.706725 -0.00760718 0.597197 0.00725777C0.487669 0.0221227 0.383754 0.0594688 0.294002 0.116222C0.203533 0.17242 0.129688 0.246591 0.0785667 0.33261C0.0274456 0.418628 0.000515867 0.514024 2.33347e-06 0.610917V9.1612C-0.00037648 9.28923 0.0453756 9.41414 0.130792 9.51825C0.216208 9.62236 0.336968 9.70042 0.476002 9.7414L4.676 10.9629C4.81701 11.003 4.96899 11.003 5.11 10.9629L9.1 9.80247L13.076 10.9934C13.1503 11.0022 13.2257 11.0022 13.3 10.9934C13.4464 10.9952 13.5892 10.9544 13.706 10.8774C13.7965 10.8212 13.8703 10.747 13.9214 10.661C13.9726 10.575 13.9995 10.4796 14 10.3827V1.83239C14.0004 1.70435 13.9546 1.57945 13.8692 1.47533C13.7838 1.37122 13.663 1.29316 13.524 1.25219ZM4.2 9.53375L1.4 8.72147V1.45984L4.2 2.27211V9.53375ZM8.4 8.72147L5.6 9.53375V2.27211L8.4 1.45984V8.72147ZM12.6 9.53375L9.8 8.72147V1.45984L12.6 2.27211V9.53375Z" fill="currentColor"/>
                                </svg>
                                {texts.viewOnMap}
                            </Button>
                            <Button
                                variant="outline-black"
                                className={s.actionBtn}
                                href={`/our-stores/${shop.id}/menu`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="14" viewBox="0 0 11 14" fill="none">
                                    <path d="M6.1875 8.4H3.4375C3.25516 8.4 3.0803 8.47375 2.95136 8.60503C2.82243 8.7363 2.75 8.91435 2.75 9.1C2.75 9.28565 2.82243 9.4637 2.95136 9.59497C3.0803 9.72625 3.25516 9.8 3.4375 9.8H6.1875C6.36984 9.8 6.5447 9.72625 6.67364 9.59497C6.80257 9.4637 6.875 9.28565 6.875 9.1C6.875 8.91435 6.80257 8.7363 6.67364 8.60503C6.5447 8.47375 6.36984 8.4 6.1875 8.4ZM8.9375 1.4H8.12625C7.98441 0.991515 7.72195 0.637699 7.37486 0.387057C7.02776 0.136415 6.61302 0.00121766 6.1875 0H4.8125C4.38698 0.00121766 3.97224 0.136415 3.62514 0.387057C3.27805 0.637699 3.01559 0.991515 2.87375 1.4H2.0625C1.51549 1.4 0.990886 1.62125 0.604092 2.01508C0.217299 2.4089 0 2.94305 0 3.5V11.9C0 12.457 0.217299 12.9911 0.604092 13.3849C0.990886 13.7788 1.51549 14 2.0625 14H8.9375C9.48451 14 10.0091 13.7788 10.3959 13.3849C10.7827 12.9911 11 12.457 11 11.9V3.5C11 2.94305 10.7827 2.4089 10.3959 2.01508C10.0091 1.62125 9.48451 1.4 8.9375 1.4ZM4.125 2.1C4.125 1.91435 4.19743 1.7363 4.32636 1.60503C4.4553 1.47375 4.63016 1.4 4.8125 1.4H6.1875C6.36984 1.4 6.5447 1.47375 6.67364 1.60503C6.80257 1.7363 6.875 1.91435 6.875 2.1V2.8H4.125V2.1ZM9.625 11.9C9.625 12.0857 9.55257 12.2637 9.42364 12.395C9.29471 12.5263 9.11984 12.6 8.9375 12.6H2.0625C1.88016 12.6 1.7053 12.5263 1.57636 12.395C1.44743 12.2637 1.375 12.0857 1.375 11.9V3.5C1.375 3.31435 1.44743 3.1363 1.57636 3.00503C1.7053 2.87375 1.88016 2.8 2.0625 2.8H2.75V3.5C2.75 3.68565 2.82243 3.8637 2.95136 3.99497C3.0803 4.12625 3.25516 4.2 3.4375 4.2H7.5625C7.74484 4.2 7.9197 4.12625 8.04864 3.99497C8.17757 3.8637 8.25 3.68565 8.25 3.5V2.8H8.9375C9.11984 2.8 9.29471 2.87375 9.42364 3.00503C9.55257 3.1363 9.625 3.31435 9.625 3.5V11.9ZM7.5625 5.6H3.4375C3.25516 5.6 3.0803 5.67375 2.95136 5.80503C2.82243 5.9363 2.75 6.11435 2.75 6.3C2.75 6.48565 2.82243 6.6637 2.95136 6.79497C3.0803 6.92625 3.25516 7 3.4375 7H7.5625C7.74484 7 7.9197 6.92625 8.04864 6.79497C8.17757 6.6637 8.25 6.48565 8.25 6.3C8.25 6.11435 8.17757 5.9363 8.04864 5.80503C7.9197 5.67375 7.74484 5.6 7.5625 5.6Z" fill="currentColor"/>
                                </svg>
                                {texts.viewMenu}
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
                                            <p className={s.title}>{texts.email}</p>
                                        </div>
                                        <a href={`mailto:${shop.email}`} className={s.text}>{shop.email}</a>
                                    </div>
                                )}
                                {groupedSchedule.length > 0 && (
                                    <div className={s.detailItem}>
                                        <div className={s.detailItemHeader}>
                                            <p className={s.title}>{texts.workingHours}</p>
                                        </div>
                                        <div className={s.scheduleList}>
                                            {groupedSchedule.map((line, idx) => (
                                                <p key={idx} className={s.text}>{line}</p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {phone && (
                                    <div className={s.detailItem}>
                                        <div className={s.detailItemHeader}>
                                            <p className={s.title}>{texts.phone}</p>
                                        </div>
                                        <a href={`tel:${phone.replace(/\s+/g, '')}`} className={s.text}>{phone}</a>
                                    </div>
                                )}
                                <div className={clsx(s.detailItem, s.lastItem)}>
                                    <div className={s.detailItemHeader}>
                                        <p className={s.title}>{texts.address}</p>
                                    </div>
                                    <a
                                        href={createGoogleMapsLink(shop.lat, shop.lng, address)}
                                        className={s.text}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <GeocodedAddressClient lat={shop.lat} lng={shop.lng} fallbackAddress={address} />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {shop.googleReviewsUrl && (
                            <Button
                                variant="black"
                                href={shop.googleReviewsUrl}
                                className={s.googleReviewBtn}
                                target="_blank"
                            >
                                {texts.leaveReview}
                            </Button>
                        )}

                        <div className={s.about}>
                            <h2 className={s.sectionTitle}>{texts.aboutStore}</h2>
                            <p className={s.aboutText}>
                                {shop.description || (
                                    <>
                                        {texts.defaultDescLine1}<br />
                                        {texts.defaultDescLine2}
                                    </>
                                )}
                            </p>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
};

export default StoreDetailPage;
