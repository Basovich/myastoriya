import React from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import s from './RecentOrderCard.module.scss';

const cardDict = {
    ua: {
        title: "Останнє / Активне замовлення",
        statusLabel: "Статус:",
        detailsButton: "ДЕТАЛІ",
        moreItems: "+{count}",
        noOrders: "Ви ще не робили замовлень"
    },
    ru: {
        title: "Последний / Активный заказ",
        statusLabel: "Статус:",
        detailsButton: "ДЕТАЛИ",
        moreItems: "+{count}",
        noOrders: "Вы еще не делали заказов"
    }
};

interface RecentOrderCardProps {
    status?: string;
    items?: string[];
    totalItems?: number;
    onDetails?: () => void;
}

export default function RecentOrderCard({ status = '', items = [], totalItems = 0, onDetails }: RecentOrderCardProps) {
    const params = useParams();
    const lang = (params?.lang as 'ua' | 'ru') || 'ua';
    const dict = cardDict[lang] || cardDict.ua;
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
                {items.length === 0 ? (
                    <div className={s.noOrdersText}>{dict.noOrders}</div>
                ) : (
                    <>
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
                            {onDetails && (
                                <button type="button" className={s.detailsBtn} onClick={onDetails}>
                                    {dict.detailsButton}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
