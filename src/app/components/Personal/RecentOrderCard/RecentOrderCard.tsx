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
    onDetails?: () => void;
}

export default function RecentOrderCard({ status, items, totalItems, dict, onDetails }: RecentOrderCardProps) {
    const displayLimit = 4;
    const hasMore = totalItems > displayLimit;
    const displayItems = hasMore ? items.slice(0, displayLimit) : items;
    const remainingCount = totalItems - 3;

    // Split title by slash for green highlighting
    const parts = dict.title.split('/');
    const renderedTitle = parts.length > 1 ? (
        <>
            <span className={s.titleBlack}>{parts[0]}/</span>
            <span className={s.titleGreen}>{parts[1]}</span>
        </>
    ) : (
        dict.title
    );

    return (
        <div className={s.recentOrderCard}>
            <div className={s.header}>
                <h3 className={s.title}>{renderedTitle}</h3>
            </div>
            
            <div className={s.content}>
                <div className={s.itemsRow}>
                    {displayItems.map((src, i) => {
                        const isOverlayItem = hasMore && i === displayLimit - 1;
                        return (
                            <div key={i} className={s.itemThumb}>
                                <Image 
                                    src={src || '/images/product-placeholder.svg'} 
                                    alt="Product" 
                                    width={64} 
                                    height={64} 
                                    className={s.img}
                                />
                                {isOverlayItem && (
                                    <div className={s.moreOverlay}>
                                        +{remainingCount}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                
                <div className={s.footer}>
                    <div className={s.statusInfo}>
                        <span className={s.label}>{dict.statusLabel}</span>
                        <span className={s.status}>{status}</span>
                    </div>
                    <button type="button" className={s.detailsBtn} onClick={onDetails}>
                        {dict.detailsButton}
                    </button>
                </div>
            </div>
        </div>
    );
}
