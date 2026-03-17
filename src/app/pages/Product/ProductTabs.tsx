'use client';

import React, { useState } from 'react';
import clsx from 'clsx';
import styles from './Product.module.scss';

interface ProductTabsProps {
    description: string;
    characteristics: Record<string, string>;
    delivery: string;
}

const ProductTabs: React.FC<ProductTabsProps> = ({ description, characteristics, delivery }) => {
    const [activeTab, setActiveTab] = useState<'description' | 'characteristics' | 'delivery'>('description');

    const tabs = [
        { id: 'description', label: 'Опис', icon: '/images/product/tab-description.svg' },
        { id: 'characteristics', label: 'Характеристики', icon: '/images/product/tab-characteristics.svg' },
        { id: 'delivery', label: 'Доставка', icon: '/images/product/tab-delivery.svg' },
    ];

    return (
        <div className={styles.tabsWrapper}>
            <div className={styles.tabsHeader}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={clsx(styles.tabButton, activeTab === tab.id && styles.active)}
                        onClick={() => setActiveTab(tab.id as any)}
                    >
                        <img src={tab.icon} alt={tab.label} />
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
                        <ul>
                            {Object.entries(characteristics).map(([key, value]) => (
                                <li key={key}>
                                    <span className={styles.charKey}>{key}:</span>
                                    <span className={styles.charValue}>{value}</span>
                                </li>
                            ))}
                        </ul>
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
