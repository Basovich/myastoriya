'use client';

import React, { useState } from 'react';
import clsx from 'clsx';
import styles from './Product.module.scss';
import Image from "next/image";

interface ProductTabsProps {
    description: string;
    characteristics: Record<string, string>;
    delivery: string;
}

const ProductTabs: React.FC<ProductTabsProps> = ({ description, characteristics, delivery }) => {
    const [activeTab, setActiveTab] = useState<'description' | 'characteristics' | 'allergens' | 'delivery'>('description');

    const tabs = [
        { id: 'description', label: 'Опис', icon: '/images/product/tab-description.svg' },
        { id: 'characteristics', label: 'Характеристики', icon: '/images/product/tab-characteristics.svg' },
        { id: 'allergens', label: 'АЛЕРГЕНИ / КАЛОРІЙНІСТЬ', icon: '/images/product/tab-characteristics.svg' }, // Temporary icon
        { id: 'delivery', label: 'Доставка', icon: '/images/product/tab-delivery.svg' },
    ] as const;

    // Nutritional data from the screenshot
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

    // Allergens data from the screenshot
    const allergensInfo = [
        { key: "Цитрусовий", value: "Апельсинова цедра" },
        { key: "Морепродукти", value: "М'ясо краба" },
        { key: "Тип соусу", value: "Соус для бургерів" },
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
                        <p>{delivery}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductTabs;
