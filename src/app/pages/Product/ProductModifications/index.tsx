'use client';

import React from 'react';
import clsx from 'clsx';
import styles from '../Product.module.scss';

import { ModifierImages } from '@/lib/graphql/queries/products';

interface Modification {
    id: string;
    name: string;
    price: number;
    image?: string | ModifierImages | null;
}

interface ProductModificationsProps {
    title: string;
    items: Modification[];
    selectedItems: string[];
    onToggle: (id: string) => void;
    className?: string;
}

const getImageUrl = (image?: string | ModifierImages | null): string | null => {
    if (!image) return null;
    if (typeof image === 'string') return image;
    return image.icon1x || image.icon2x || image.icon3x || null;
};

const ProductModifications: React.FC<ProductModificationsProps> = ({ 
    title, 
    items, 
    selectedItems, 
    onToggle,
    className
}) => {
    return (
        <div className={clsx(styles.modificationsSection, className)}>
            <p className={styles.modSectionTitle}>{title}</p>
            <div className={styles.modGrid}>
                {items?.map((item) => {
                    const imgUrl = getImageUrl(item.image);
                    return (
                        <button
                            key={item.id}
                            className={clsx(styles.modItem, selectedItems.includes(item.id) && styles.selected)}
                            onClick={() => onToggle(item.id)}
                        >
                            {imgUrl && (
                                <div className={styles.modTooltip}>
                                    <img src={imgUrl} alt={item.name} className={styles.modTooltipImg} />
                                </div>
                            )}
                        <div className={styles.modCheck}>
                            {selectedItems.includes(item.id) && (
                                <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </div>
                        <div className={styles.modInfo}>
                            <span className={styles.modName}>{item.name}</span>
                            <span className={styles.modPrice}>+ {item.price} ₴</span>
                        </div>
                    </button>
                );
            })}
            </div>
        </div>
    );
};

export default ProductModifications;
