'use client';

import React, { useState } from 'react';
import clsx from 'clsx';
import styles from '../Product.module.scss';
import Image from "next/image";
import DeliveryAccordion from '@/app/components/ui/DeliveryAccordion/DeliveryAccordion';
import VideoModal from '@/app/components/VideoModal/VideoModal';

interface ProductTabsProps {
    description: string;
    characteristics: Record<string, string>;
    delivery: string;
}


// --- Icons ---
const BoxIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
        <path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
    </svg>
);

const TruckIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-5h-7v7Z"/><path d="M13 9h4"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>
    </svg>
);

const StoreIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 10V7"/>
    </svg>
);

const BagIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
);

const CarIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M9 17h6"/>
    </svg>
);

const ProductTabs: React.FC<ProductTabsProps> = ({ description, characteristics, delivery }) => {
    const [activeTab, setActiveTab] = useState<'description' | 'characteristics' | 'allergens' | 'delivery'>('description');
    const [isVideoOpen, setIsVideoOpen] = useState(false);

    const tabs = [
        { id: 'description', label: 'Опис', icon: '/images/product/tab-description.svg' },
        { id: 'characteristics', label: 'Характеристики', icon: '/images/product/tab-characteristics.svg' },
        { id: 'allergens', label: 'АЛЕРГЕНИ / КАЛОРІЙНІСТЬ', icon: '/images/product/tab-characteristics.svg' },
        { id: 'delivery', label: 'Доставка', icon: '/images/product/tab-delivery.svg' },
    ] as const;

    // Nutritional data
    const nutritionInfo = {
        per100g: [
            { key: "Жири (на 100 г)", value: "12.4" },
            { key: "Білки (на 100 г)", value: "14.7" },
            { key: "Вуглеводи (на 100 г)", value: "16.3" },
            { key: "Калорійність (на 100 г)", value: "345.9" },
        ],
        perPortion: [
            { key: "Жири (на 1 порцію)", value: "45.4" },
            { key: "Білки (на 1 порцію)", value: "89.7" },
            { key: "Вуглеводи (на 1 порцію)", value: "78.3" },
            { key: "Калорійність (на 1 порцію)", value: "2345.9" },
        ]
    };

    // Allergens data
    const allergensInfo = [
        { key: "Цитрусовий", value: "Апельсинова цедра" },
        { key: "Морепродукти", value: "М'ясо краба" },
        { key: "Тип соусу", value: "Соус для бургерів" },
    ];

    // Helper to extract YouTube ID and get thumbnail
    const getYouTubeThumbnail = (url: string) => {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        const videoId = (match && match[7].length === 11) ? match[7] : null;
        return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
    };

    const deliveryVideoUrl = "https://www.youtube.com/watch?v=ixeV2E3by60";
    const deliveryThumbnailUrl = getYouTubeThumbnail(deliveryVideoUrl);

    // Delivery items
    const deliveryItems = [
        {
            icon: <BoxIcon />,
            title: "Доставка по Києву",
            content: (
                <ul>
                    <li>Вартість доставки: 100 грн.</li>
                    <li>Мінімальна сума замовлення: 400 грн.</li>
                    <li>При замовленні на суму від 1200 грн доставка безкоштовна.</li>
                    <li>Термін доставки по Києву — 60-90 хвилин при замовленні з 10:00 до 21:00. <br/> Замовлення, зроблені після 21:00, доставляються наступного дня.</li>
                    <li>Термін доставки може бути збільшено, залежно від завантаженості доріг та рівня безпеки у місті.</li>
                    <li>Страви категорії «Набори для компанії» готуються 1.5-2 години, тому час доставки може бути збільшено з урахуванням часу на приготування.</li>
                </ul>
            )
        },
        {
            icon: <TruckIcon />,
            title: "Доставка по Україні",
            content: (
                <div className={styles.videoContent}>
                    <div className={styles.videoPreview} onClick={() => setIsVideoOpen(true)}>
                        <Image 
                            src={deliveryThumbnailUrl} 
                            alt="Video Preview" 
                            width={280} 
                            height={158}
                            unoptimized // YouTube images often need this to avoid issues with Next.js optimization for external domains without config
                        />
                        <div className={styles.playBtn}>
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 9L5 15L5 3L15 9Z" fill="currentColor"/>
                            </svg>
                        </div>
                    </div>
                    <ul>
                        <li>У регіони, де не поновила роботу «Нова Пошта» та ведуться активні бойові дії, доставка тимчасово не здійснюється.</li>
                        <li>Мінімальна сума замовлення — 1500 грн. При замовленні на суму до 3000 грн вартість доставки — 260 грн. Якщо сума перевищує 3000 грн — доставка безкоштовна.</li>
                        <li>Доставка по Україні здійснюється після 100% передплати.</li>
                        <li>До вартості доставки входить термобокс із холодоагентом, щоб ви гарантовано отримали свіжу продукцію.</li>
                        <li>Товар відправляємо після 100% передплати цього ж дня, якщо ваше замовлення підтверджене та оплачене до 13:00.</li>
                        <li>Термін доставки по Україні — 1-3 дні. Продукти залишаться свіжими завдяки термобоксу та холодоагенту.</li>
                        <li>Доставка продукції по Україні здійснюється тільки в сирому вигляді.</li>
                        <li>До замовлень на суму понад 6000 грн додається термосумка у подарунок.</li>
                    </ul>
                </div>
            )
        },
        {
            icon: <StoreIcon />,
            title: "Самовивіз з ресторанів",
            content: <p>Ви можете забрати своє замовлення самостійно з будь-якого нашого магазину-ресторану.</p>
        },
        {
            icon: <BagIcon />,
            title: "Безкоштовна доставка в радіусі 2-3 км від магазину-ресторану",
            content: <p>При сумі замовлення від 500 грн доставка в межах 2-3 км від ресторану безкоштовна.</p>
        },
        {
            icon: <CarIcon />,
            title: "Доставка за Київ",
            content: <p>Доставка за межі Києва здійснюється за тарифами таксі або за домовленістю з кур'єром.</p>
        }
    ];

    return (
        <div className={styles.tabsWrapper}>
            <div className={styles.tabsHeader}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={clsx(styles.tabButton, activeTab === tab.id && styles.active)}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <Image src={tab.icon} alt={tab.label} width={24} height={24} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>
            <div className={styles.tabContent}>
                {activeTab === 'description' && (
                    <div className={styles.description}>
                        <p>{description}</p>
                    </div>
                )}
                {activeTab === 'characteristics' && (
                    <div className={styles.characteristics}>
                        <div className={styles.nutritionGroup}>
                            <h3 className={styles.nutritionTitle}>Калорійність (на 100 г продукту)</h3>
                            <div className={styles.nutritionList}>
                                {nutritionInfo.per100g.map((item) => (
                                    <div key={item.key} className={styles.nutritionRow}>
                                        <span className={styles.nutritionKey}>{item.key}</span>
                                        <span className={styles.nutritionValue}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.nutritionGroup}>
                            <h3 className={styles.nutritionTitle}>Калорійність (на 1 порцію)</h3>
                            <div className={styles.nutritionList}>
                                {nutritionInfo.perPortion.map((item) => (
                                    <div key={item.key} className={styles.nutritionRow}>
                                        <span className={styles.nutritionKey}>{item.key}</span>
                                        <span className={styles.nutritionValue}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'allergens' && (
                    <div className={styles.allergens}>
                        <div className={styles.nutritionGroup}>
                            <h3 className={styles.nutritionTitle}>Алергени</h3>
                            <div className={styles.nutritionList}>
                                {allergensInfo.map((item) => (
                                    <div key={item.key} className={styles.nutritionRow}>
                                        <span className={styles.nutritionKey}>{item.key}</span>
                                        <span className={styles.nutritionValue}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'delivery' && (
                    <div className={styles.delivery}>
                        <h2 className={styles.nutritionTitle}>СПОСОБИ ДОСТАВКИ</h2>
                        <DeliveryAccordion items={deliveryItems} />
                    </div>
                )}
            </div>

            <VideoModal 
                isOpen={isVideoOpen} 
                onClose={() => setIsVideoOpen(false)} 
                videoUrl="https://www.youtube.com/watch?v=ixeV2E3by60"
            />
        </div>
    );
};

export default ProductTabs;
