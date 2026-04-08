import React from 'react';
import Image from 'next/image';
import s from './RecentOrderCard.module.scss';

interface RecentOrderCardProps {
    status: string;
    items: string[];
    totalItems: number;
    dict: {
        title: string;
        statusLabel: string;
        detailsButton: string;
        moreItems: string;
    };
}

export default function RecentOrderCard({ status, items, totalItems, dict }: RecentOrderCardProps) {
    const displayItems = items.slice(0, 3);
    const remainingCount = totalItems - displayItems.length;

    return (
        <div className={s.recentOrderCard}>
            <div className={s.header}>
                <h3 className={s.title}>{dict.title}</h3>
            </div>
            
            <div className={s.content}>
                <div className={s.itemsRow}>
                    {displayItems.map((src, i) => (
                        <div key={i} className={s.itemThumb}>
                            <Image 
                                src={src} 
                                alt="Product" 
                                width={80} 
                                height={80} 
                                className={s.img}
                            />
                        </div>
                    ))}
                    {remainingCount > 0 && (
                        <div className={s.itemThumb}>
                            <div className={s.moreOverlay}>
                                {dict.moreItems.replace('{count}', remainingCount.toString())}
                            </div>
                        </div>
                    )}
                </div>
                
                <div className={s.footer}>
                    <div className={s.statusInfo}>
                        <span className={s.label}>{dict.statusLabel}</span>
                        <span className={s.status}>{status}</span>
                    </div>
                    <button type="button" className={s.detailsBtn}>
                        {dict.detailsButton}
                    </button>
                </div>
            </div>
        </div>
    );
}
