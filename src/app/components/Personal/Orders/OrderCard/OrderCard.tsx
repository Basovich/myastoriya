import React from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import s from './OrderCard.module.scss';
import Button from '@/app/components/ui/Button/Button';

export interface OrderCardProps {
    orderNumber: string;
    status: string;
    statusVariant?: 'success' | 'warning' | 'error';
    source: string;
    products: string[]; // array of image urls
    totalProductsCount: number;
    sum: number;
    oldSum?: number;
    date: string;
    time: string;
    onRepeatOrder: () => void;
    onDetails: () => void;
    onReview: () => void;
    dict: {
        orderPrefix: string;
        sourcePrefix: string;
        sumLabel: string;
        reviewLink: string;
        repeatBtn: string;
        detailsBtn: string;
    };
}

export default function OrderCard({
    orderNumber,
    status,
    statusVariant = 'success',
    source,
    products,
    totalProductsCount,
    sum,
    oldSum,
    date,
    time,
    onRepeatOrder,
    onDetails,
    onReview,
    dict,
}: OrderCardProps) {
    const displayCount = 4;
    const displayProducts = products.slice(0, displayCount);
    const remainingCount = totalProductsCount > displayCount ? totalProductsCount - displayCount : 0;

    return (
        <div className={s.orderCard}>
            {/* Top row */}
            <div className={s.topRow}>
                <div className={s.statusBadge}>
                    {statusVariant === 'success' && (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7 0C3.13401 0 0 3.13401 0 7C0 10.866 3.13401 14 7 14C10.866 14 14 10.866 14 7C14 3.13401 10.866 0 7 0ZM10.5986 4.79373L5.92348 9.46884C5.82397 9.56835 5.69467 9.61811 5.56537 9.61811C5.43606 9.61811 5.30676 9.56835 5.20726 9.46884L3.40142 7.663C3.20359 7.46517 3.20359 7.14441 3.40142 6.94658C3.59925 6.74875 3.92002 6.74875 4.11785 6.94658L5.56537 8.3941L9.88215 4.07732C10.08 3.87948 10.4008 3.87948 10.5986 4.07732C10.7964 4.27515 10.7964 4.59591 10.5986 4.79373Z" fill="#13A556"/>
                        </svg>
                    )}
                    <span className={clsx(s.statusText, s[`status_${statusVariant}`])}>{status}</span>
                </div>
                <div className={s.sourceText}>{dict.sourcePrefix}: <strong>{source}</strong></div>
            </div>

            {/* Title / Order Number */}
            <div className={s.orderNumberRow}>
                <span className={s.orderNumber}>{dict.orderPrefix} <strong>{orderNumber}</strong></span>
            </div>

            {/* Middle row: Products & Price on Desktop */}
            <div className={s.middleRow}>
                <div className={s.productsList}>
                    {displayProducts.map((src, idx) => (
                        <div key={idx} className={s.productThumb}>
                            <Image src={src} alt="Product" width={64} height={64} className={s.img} />
                        </div>
                    ))}
                    {remainingCount > 0 && (
                        <div className={s.productThumb}>
                            <Image src={products[displayCount] || products[0]} alt="Product overlay" width={64} height={64} className={s.img} />
                            <div className={s.moreOverlay}>+{remainingCount}</div>
                        </div>
                    )}
                </div>
                <div className={s.priceBlockDesktop}>
                    <span className={s.priceLabel}>{dict.sumLabel}</span>
                    <div className={s.priceValues}>
                        <span className={s.currentPrice}>{sum.toLocaleString('ru-RU')} ₴</span>
                        {oldSum && <span className={s.oldPrice}>{oldSum.toLocaleString('ru-RU')} ₴</span>}
                    </div>
                </div>
            </div>

            {/* Meta info (Date, Time, Review) */}
            <div className={s.metaRow}>
                <div className={s.metaItem}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.25 1.75H11.375V0.875H10.5V1.75H3.5V0.875H2.625V1.75H1.75C1.26875 1.75 0.875 2.14375 0.875 2.625V12.25C0.875 12.7313 1.26875 13.125 1.75 13.125H12.25C12.7313 13.125 13.125 12.7313 13.125 12.25V2.625C13.125 2.14375 12.7313 1.75 12.25 1.75ZM12.25 12.25H1.75V4.375H12.25V12.25Z" fill="#1C1B1B"/>
                    </svg>
                    <span>{date}</span>
                </div>
                <div className={s.metaItem}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 0C3.13437 0 0 3.13437 0 7C0 10.8656 3.13437 14 7 14C10.8656 14 14 10.8656 14 7C14 3.13437 10.8656 0 7 0ZM7 12.6875C3.86563 12.6875 1.3125 10.1344 1.3125 7C1.3125 3.86563 3.86563 1.3125 7 1.3125C10.1344 1.3125 12.6875 3.86563 12.6875 7C12.6875 10.1344 10.1344 12.6875 7 12.6875ZM7.4375 3.5H6.125V7.4375L9.625 9.5375L10.2812 8.46562L7.4375 6.78125V3.5Z" fill="#1C1B1B"/>
                    </svg>
                    <span>{time}</span>
                </div>
                <button type="button" className={clsx(s.metaItem, s.reviewLink)} onClick={onReview}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.25 0.875H1.75C1.26875 0.875 0.875 1.26875 0.875 1.75V9.625C0.875 10.1063 1.26875 10.5 1.75 10.5H3.5V13.125L6.125 10.5H12.25C12.7313 10.5 13.125 10.1063 13.125 9.625V1.75C13.125 1.26875 12.7313 0.875 12.25 0.875ZM12.25 9.625H5.75L4.375 11V9.625H1.75V1.75H12.25V9.625ZM9.625 4.375H4.375V5.25H9.625V4.375ZM8.75 6.125H4.375V7H8.75V6.125Z" fill="#1C1B1B"/>
                    </svg>
                    <span>{dict.reviewLink}</span>
                </button>
            </div>

            {/* Actions & Mobile Price */}
            <div className={s.actionsRow}>
                <Button variant="outline-black" className={s.repeatBtn} onClick={onRepeatOrder}>
                    {dict.repeatBtn}
                </Button>
                
                <div className={s.priceBlockMobile}>
                    <span className={s.priceLabel}>{dict.sumLabel}</span>
                    <div className={s.priceValues}>
                        <span className={s.currentPrice}>{sum.toLocaleString('ru-RU')} ₴</span>
                        {oldSum && <span className={s.oldPrice}>{oldSum.toLocaleString('ru-RU')} ₴</span>}
                    </div>
                </div>

                <Button variant="black" className={s.detailsBtn} onClick={onDetails}>
                    {dict.detailsBtn}
                </Button>
            </div>
        </div>
    );
}
