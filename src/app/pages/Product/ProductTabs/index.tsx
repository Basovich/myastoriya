'use client';

import { useState } from 'react';
import clsx from 'clsx';
import styles from '../Product.module.scss';
import Image from "next/image";
import DeliveryAccordion from '@/app/components/ui/DeliveryAccordion/DeliveryAccordion';
import VideoModal from '@/app/components/VideoModal/VideoModal';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/free-mode';
import type { OrderingInfoBlock } from '@/lib/graphql';

interface ProductTabsProps {
    description: string;
    characteristics: Record<string, string>;
    deliveryBlocks: OrderingInfoBlock[];
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

type TabId = 'description' | 'characteristics' | 'allergens' | 'delivery';

interface TabItem {
    id: TabId;
    label: string;
    icon: string;
}

const ProductTabs: React.FC<ProductTabsProps> = ({ description, characteristics, deliveryBlocks }) => {
    const [activeTab, setActiveTab] = useState<TabId>('description');
    const [isVideoOpen, setIsVideoOpen] = useState(false);

    // Parse characteristics from API
    const parsedSpecs = Object.entries(characteristics);

    const isNutritionKey = (key: string) => {
        const lower = key.toLowerCase();
        return lower.includes('калорій') || lower.includes('калорий') ||
               lower.includes('білк') || lower.includes('белк') ||
               lower.includes('жир') ||
               lower.includes('вуглев') || lower.includes('углев');
    };

    const is100gKey = (key: string) => {
        return key.includes('100');
    };

    const isPortionKey = (key: string) => {
        const lower = key.toLowerCase();
        return lower.includes('порц') || lower.includes('порці') || lower.includes('порци') || lower.includes('порцію') || lower.includes('порцию');
    };

    const isAllergensKey = (key: string) => {
        const lower = key.toLowerCase();
        return lower.includes('алерген') || lower.includes('аллерген');
    };

    // Filter specifications
    const generalSpecs = parsedSpecs.filter(([key]) => !isNutritionKey(key) && !isAllergensKey(key));
    
    const apiNutrition100g = parsedSpecs
        .filter(([key]) => isNutritionKey(key) && is100gKey(key))
        .map(([key, value]) => ({ key, value }));
        
    const apiNutritionPortion = parsedSpecs
        .filter(([key]) => isNutritionKey(key) && isPortionKey(key))
        .map(([key, value]) => ({ key, value }));

    const apiAllergens = parsedSpecs
        .filter(([key]) => isAllergensKey(key))
        .map(([key, value]) => ({ key, value }));

    const hasNutritionOrAllergens = apiNutrition100g.length > 0 || apiNutritionPortion.length > 0 || apiAllergens.length > 0;

    // Create dynamic tabs list
    const tabs: TabItem[] = [
        { id: 'description', label: 'Опис', icon: '/images/product/tab-description.svg' },
        ...(generalSpecs.length > 0 ? [{ id: 'characteristics', label: 'Характеристики', icon: '/images/product/tab-characteristics.svg' } as TabItem] : []),
        ...(hasNutritionOrAllergens ? [{ id: 'allergens', label: 'АЛЕРГЕНИ / КАЛОРІЙНІСТЬ', icon: '/images/product/tab-characteristics.svg' } as TabItem] : []),
        { id: 'delivery', label: 'Доставка', icon: '/images/product/tab-delivery.svg' },
    ];

    // Helper to render text with bold parts and red highlighting (similar to DeliveryMethodCard)
    const renderStyledText = (text: string) => {
        const keywords = [
            "доставка безкоштовна", 
            "безкоштовна доставка", 
            "доставка бесплатная", 
            "бесплатная доставка"
        ];
        
        const regex = new RegExp(`(\\*\\*.*?\\*\\*|${keywords.join('|')})`, 'gi');
        const parts = text.split(regex);

        return (
            <>
                {parts.map((part, i) => {
                    const lowerPart = part.toLowerCase();
                    if (keywords.includes(lowerPart)) {
                        return <strong key={i} style={{ color: '#E31E24' }}>{part}</strong>;
                    }
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={i}>{part.slice(2, -2)}</strong>;
                    }
                    return <span key={i}>{part}</span>;
                })}
            </>
        );
    };

    // Map API delivery blocks to accordion items
    const deliveryItems = deliveryBlocks.map((block) => {
        const iconUrl = block.icon;
        const nameLower = block.name.toLowerCase();
        
        // Find appropriate icon or fallback to default
        let iconElement: React.ReactNode = <CarIcon />;
        if (iconUrl) {
            iconElement = (
                <Image 
                    src={iconUrl.startsWith('/') ? `https://dev-api.myastoriya.com.ua${iconUrl}` : iconUrl} 
                    alt={block.name} 
                    width={24} 
                    height={24} 
                />
            );
        } else if (nameLower.includes('самовивіз') || nameLower.includes('ресторан') || nameLower.includes('магазин')) {
            iconElement = <StoreIcon />;
        } else if (nameLower.includes('києв') || nameLower.includes('київ')) {
            iconElement = <BoxIcon />;
        } else if (nameLower.includes('україна') || nameLower.includes('украина')) {
            iconElement = <TruckIcon />;
        } else if (nameLower.includes('безкоштовна') || nameLower.includes('2-3 км')) {
            iconElement = <BagIcon />;
        }

        // Render content (HTML or plain list)
        let contentElement: React.ReactNode;
        if (block.textWeb && block.textWeb.length > 0) {
            contentElement = (
                <div 
                    className={styles.description}
                    dangerouslySetInnerHTML={{ 
                        __html: Array.isArray(block.textWeb) 
                            ? block.textWeb.join('') 
                            : block.textWeb 
                    }}
                />
            );
        } else if (block.text && block.text.length > 0) {
            contentElement = (
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {block.text.map((feature, index) => (
                        <li key={index} style={{ lineHeight: '1.65' }}>
                            {renderStyledText(feature)}
                        </li>
                    ))}
                </ul>
            );
        } else {
            contentElement = null;
        }

        return {
            icon: iconElement,
            title: block.name,
            content: contentElement
        };
    });

    return (
        <div className={styles.tabsWrapper}>
            <div className={styles.tabsHeader}>
                <Swiper
                    slidesPerView={'auto'}
                    spaceBetween={16}
                    className={styles.tabsSwiper}
                    breakpoints={{
                        1024: {
                            spaceBetween: 60
                        }
                    }}
                >
                    {tabs.map((tab) => (
                        <SwiperSlide key={tab.id} className={styles.tabSlide}>
                            <button
                                className={clsx(styles.tabButton, activeTab === tab.id && styles.active)}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <Image src={tab.icon} alt={tab.label} width={24} height={24} />
                                <span>{tab.label}</span>
                            </button>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
            <div className={styles.tabContent}>
                {activeTab === 'description' && (
                    <div
                        className={styles.description}
                        // eslint-disable-next-line react/no-danger
                        dangerouslySetInnerHTML={{ __html: description }}
                    />
                )}
                {activeTab === 'characteristics' && generalSpecs.length > 0 && (
                    <div className={styles.characteristics}>
                        <div className={styles.nutritionGroup}>
                            <p className={styles.nutritionTitle}>Характеристики товару</p>
                            <div className={styles.nutritionList}>
                                {generalSpecs.map(([key, value]) => (
                                    <div key={key} className={styles.nutritionRow}>
                                        <span className={styles.nutritionKey}>{key}</span>
                                        <span className={styles.nutritionValue}>{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'allergens' && hasNutritionOrAllergens && (
                    <div className={styles.allergens}>
                        {apiNutrition100g.length > 0 && (
                            <div className={styles.nutritionGroup}>
                                <p className={styles.nutritionTitle}>Калорійність (на 100 г продукту)</p>
                                <div className={styles.nutritionList}>
                                    {apiNutrition100g.map((item) => (
                                        <div key={item.key} className={styles.nutritionRow}>
                                            <span className={styles.nutritionKey}>{item.key}</span>
                                            <span className={styles.nutritionValue}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {apiNutritionPortion.length > 0 && (
                            <div className={styles.nutritionGroup}>
                                <p className={styles.nutritionTitle}>Калорійність (на 1 порцію)</p>
                                <div className={styles.nutritionList}>
                                    {apiNutritionPortion.map((item) => (
                                        <div key={item.key} className={styles.nutritionRow}>
                                            <span className={styles.nutritionKey}>{item.key}</span>
                                            <span className={styles.nutritionValue}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {apiAllergens.length > 0 && (
                            <div className={styles.nutritionGroup}>
                                <p className={styles.nutritionTitle}>Алергени</p>
                                <div className={styles.nutritionList}>
                                    {apiAllergens.map((item) => (
                                        <div key={item.key} className={styles.nutritionRow}>
                                            <span className={styles.nutritionKey}>{item.key}</span>
                                            <span className={styles.nutritionValue}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'delivery' && (
                    <div className={styles.delivery}>
                        <p className={styles.nutritionTitle}>СПОСОБИ ДОСТАВКИ</p>
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
