import React, { useState } from 'react';
import clsx from 'clsx';
import styles from './Product.module.scss';

interface Modification {
    id: string;
    name: string;
    price: number;
}

interface ProductModificationsProps {
    title: string;
    items: Modification[];
}

const ProductModifications: React.FC<ProductModificationsProps> = ({ title, items }) => {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    const toggleItem = (id: string) => {
        setSelectedItems(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <div className={styles.modificationsSection}>
            <h3 className={styles.modSectionTitle}>{title}</h3>
            <div className={styles.modGrid}>
                {items.map((item) => (
                    <button
                        key={item.id}
                        className={clsx(styles.modItem, selectedItems.includes(item.id) && styles.selected)}
                        onClick={() => toggleItem(item.id)}
                    >
                        <div className={styles.modCheck}>
                            {selectedItems.includes(item.id) && (
                                <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            )}
                        </div>
                        <div className={styles.modInfo}>
                            <span className={styles.modName}>{item.name}</span>
                            <span className={styles.modPrice}>+ {item.price} ₴</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ProductModifications;
