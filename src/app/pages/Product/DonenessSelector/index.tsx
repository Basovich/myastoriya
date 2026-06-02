import React from 'react';
import Image from 'next/image';
import s from './DonenessSelector.module.scss';
import type { ProductCostVariant } from '@/lib/graphql';

/** Статичні варіанти прожарки — використовуються як fallback */
const STATIC_OPTIONS = [
    { id: 'rare', label: 'Rare', image: '/images/product/doneness/rare.png' },
    { id: 'medium-rare', label: 'Medium rare', image: '/images/product/doneness/medium-rare.png' },
    { id: 'medium', label: 'Medium', image: '/images/product/doneness/medium.png' },
    { id: 'medium-well', label: 'Medium well', image: '/images/product/doneness/medium-well.png' },
    { id: 'well-done', label: 'Well done', image: '/images/product/doneness/well-done.png' },
];

interface DonenessSelectorProps {
    value: string;
    onChange: (id: string) => void;
    /** Реальні варіанти з API. Якщо передано — використовуються замість статичних. */
    options?: ProductCostVariant[];
}

const DonenessSelector: React.FC<DonenessSelectorProps> = ({ value, onChange, options }) => {
    // Якщо є реальні варіанти з API — будуємо з них
    const items = options && options.length > 0
        ? options.map(v => ({
            id: v.id,
            label: v.name ?? v.id,
            image: v.image?.size2x || v.image?.size1x || v.image?.size3x || null,
            cost: v.cost,
        }))
        : STATIC_OPTIONS.map(o => ({ ...o, cost: undefined }));

    const selectedItem = items.find(o => o.id === value) ?? items[0];

    return (
        <div className={s.selectorWrapper}>
            <div className={s.labelRow}>
                <span className={s.label}>Оберіть рівень прожарки:</span>
                <span className={s.currentValue}>{selectedItem?.label}</span>
                {selectedItem?.cost != null && (
                    <span className={s.currentCost}>{selectedItem.cost} ₴</span>
                )}
                <button className={s.infoBtn} type="button" aria-label="Інформація про рівень прожарки">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="7.26953" y="6.54517" width="1.45455" height="6.54545" rx="0.727273" fill="black"/>
                        <circle cx="8" cy="8" r="7.4" stroke="black" strokeWidth="1.2"/>
                        <circle cx="7.9968" cy="4.36448" r="0.727273" fill="black"/>
                    </svg>
                </button>
            </div>

            <div className={s.grid}>
                {items.map((item) => (
                    <div
                        key={item.id}
                        className={`${s.item} ${value === item.id ? s.active : ''}`}
                        onClick={() => onChange(item.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && onChange(item.id)}
                        aria-pressed={value === item.id}
                        aria-label={item.label}
                    >
                        {value === item.id && (
                            <div className={s.activeTag}>
                                {item.label}
                                <div className={s.tagArraw}></div>
                            </div>
                        )}
                        <div className={s.imageBox}>
                            {item.image ? (
                                <Image
                                    src={item.image.startsWith('/') ? `https://dev-api.myastoriya.com.ua${item.image}` : item.image}
                                    alt={item.label}
                                    width={60}
                                    height={34}
                                    style={{ objectFit: 'cover' }}
                                    unoptimized
                                />
                            ) : (
                                <Image
                                    src={`/images/product/doneness/${item.id}.png`}
                                    alt={item.label}
                                    width={60}
                                    height={34}
                                    style={{ objectFit: 'cover' }}
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DonenessSelector;
