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
            {/* Top row / Header */}
            <div className={s.headerGroup}>
                <div className={s.orderNumberBlock}>
                    <span className={s.orderNumber}>{dict.orderPrefix} <strong>№{orderNumber}</strong></span>
                </div>
                <div className={s.statusBlock}>
                    {statusVariant === 'success' && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M8.904 4.753L5.901 7.763L4.746 6.608C4.68325 6.53472 4.60603 6.47521 4.51918 6.43319C4.43234 6.39117 4.33774 6.36756 4.24134 6.36384C4.14494 6.36012 4.0488 6.37636 3.95898 6.41155C3.86915 6.44674 3.78757 6.50012 3.71935 6.56834C3.65113 6.63656 3.59775 6.71814 3.56256 6.80797C3.52736 6.8978 3.51112 6.99393 3.51484 7.09034C3.51857 7.18674 3.54218 7.28133 3.58419 7.36818C3.62621 7.45502 3.68572 7.53225 3.759 7.595L5.404 9.247C5.46941 9.31187 5.54698 9.3632 5.63227 9.39804C5.71755 9.43287 5.80888 9.45053 5.901 9.45C6.08464 9.44922 6.26062 9.37632 6.391 9.247L9.891 5.747C9.95661 5.68192 10.0087 5.6045 10.0442 5.5192C10.0798 5.4339 10.0981 5.34241 10.0981 5.25C10.0981 5.15759 10.0798 5.0661 10.0442 4.98079C10.0087 4.89549 9.95661 4.81807 9.891 4.753C9.75985 4.62262 9.58243 4.54944 9.3975 4.54944C9.21257 4.54944 9.03516 4.62262 8.904 4.753ZM7 0C5.61553 0 4.26215 0.410543 3.11101 1.17971C1.95987 1.94888 1.06266 3.04213 0.532846 4.32121C0.00303299 5.6003 -0.13559 7.00776 0.134506 8.36563C0.404603 9.7235 1.07129 10.9708 2.05026 11.9497C3.02922 12.9287 4.2765 13.5954 5.63437 13.8655C6.99224 14.1356 8.3997 13.997 9.67879 13.4672C10.9579 12.9373 12.0511 12.0401 12.8203 10.889C13.5895 9.73784 14 8.38447 14 7C14 6.08075 13.8189 5.17049 13.4672 4.32121C13.1154 3.47194 12.5998 2.70026 11.9497 2.05025C11.2997 1.40024 10.5281 0.884626 9.67879 0.532843C8.82951 0.18106 7.91925 0 7 0ZM7 12.6C5.89243 12.6 4.80972 12.2716 3.88881 11.6562C2.96789 11.0409 2.25013 10.1663 1.82628 9.14302C1.40243 8.11976 1.29153 6.99379 1.50761 5.90749C1.72368 4.8212 2.25703 3.82337 3.0402 3.0402C3.82338 2.25703 4.8212 1.72368 5.9075 1.5076C6.99379 1.29153 8.11976 1.40242 9.14303 1.82627C10.1663 2.25012 11.0409 2.96789 11.6562 3.88881C12.2716 4.80972 12.6 5.89242 12.6 7C12.6 8.48521 12.01 9.90959 10.9598 10.9598C9.9096 12.01 8.48521 12.6 7 12.6Z" fill="#1BC573"/>
                        </svg>
                    )}
                    <span className={clsx(s.statusText, s[`status_${statusVariant}`])}>{status}</span>
                </div>
                <div className={s.sourceBlock}>
                    <span className={s.sourceText}>{dict.sourcePrefix}: <strong>{source}</strong></span>
                </div>
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none">
                        <path d="M9.35 1.1H8.25V0.55C8.25 0.404131 8.19205 0.264236 8.08891 0.161091C7.98576 0.0579462 7.84587 0 7.7 0C7.55413 0 7.41424 0.0579462 7.31109 0.161091C7.20795 0.264236 7.15 0.404131 7.15 0.55V1.1H3.85V0.55C3.85 0.404131 3.79205 0.264236 3.68891 0.161091C3.58576 0.0579462 3.44587 0 3.3 0C3.15413 0 3.01424 0.0579462 2.91109 0.161091C2.80795 0.264236 2.75 0.404131 2.75 0.55V1.1H1.65C1.21239 1.1 0.792709 1.27384 0.483274 1.58327C0.173839 1.89271 0 2.31239 0 2.75V9.35C0 9.78761 0.173839 10.2073 0.483274 10.5167C0.792709 10.8262 1.21239 11 1.65 11H9.35C9.78761 11 10.2073 10.8262 10.5167 10.5167C10.8262 10.2073 11 9.78761 11 9.35V2.75C11 2.31239 10.8262 1.89271 10.5167 1.58327C10.2073 1.27384 9.78761 1.1 9.35 1.1ZM9.9 9.35C9.9 9.49587 9.84205 9.63576 9.73891 9.73891C9.63576 9.84205 9.49587 9.9 9.35 9.9H1.65C1.50413 9.9 1.36424 9.84205 1.26109 9.73891C1.15795 9.63576 1.1 9.49587 1.1 9.35V5.5H9.9V9.35ZM9.9 4.4H1.1V2.75C1.1 2.60413 1.15795 2.46424 1.26109 2.36109C1.36424 2.25795 1.50413 2.2 1.65 2.2H2.75V2.75C2.75 2.89587 2.80795 3.03576 2.91109 3.13891C3.01424 3.24205 3.15413 3.3 3.3 3.3C3.44587 3.3 3.58576 3.24205 3.68891 3.13891C3.79205 3.03576 3.85 2.89587 3.85 2.75V2.2H7.15V2.75C7.15 2.89587 7.20795 3.03576 7.31109 3.13891C7.41424 3.24205 7.55413 3.3 7.7 3.3C7.84587 3.3 7.98576 3.24205 8.08891 3.13891C8.19205 3.03576 8.25 2.89587 8.25 2.75V2.2H9.35C9.49587 2.2 9.63576 2.25795 9.73891 2.36109C9.84205 2.46424 9.9 2.60413 9.9 2.75V4.4Z" fill="black"/>
                    </svg>
                    <span>{date}</span>
                </div>
                <div className={s.metaItem}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M6 0C4.81331 0 3.65328 0.351894 2.66658 1.01118C1.67989 1.67047 0.910851 2.60754 0.456725 3.7039C0.0025997 4.80025 -0.11622 6.00665 0.115291 7.17054C0.346802 8.33443 0.918247 9.40352 1.75736 10.2426C2.59648 11.0818 3.66557 11.6532 4.82946 11.8847C5.99335 12.1162 7.19975 11.9974 8.2961 11.5433C9.39246 11.0891 10.3295 10.3201 10.9888 9.33342C11.6481 8.34672 12 7.18669 12 6C12 5.21207 11.8448 4.43185 11.5433 3.7039C11.2417 2.97594 10.7998 2.31451 10.2426 1.75736C9.68549 1.20021 9.02406 0.758251 8.2961 0.456723C7.56815 0.155195 6.78793 0 6 0ZM6 10.8C5.05065 10.8 4.12262 10.5185 3.33326 9.99105C2.54391 9.46362 1.92868 8.71396 1.56538 7.83688C1.20208 6.95979 1.10702 5.99467 1.29223 5.06357C1.47744 4.13246 1.9346 3.27718 2.60589 2.60589C3.27718 1.93459 4.13246 1.47744 5.06357 1.29223C5.99468 1.10702 6.9598 1.20208 7.83688 1.56538C8.71397 1.92868 9.46362 2.54391 9.99105 3.33326C10.5185 4.12262 10.8 5.05065 10.8 6C10.8 7.27304 10.2943 8.49394 9.39411 9.39411C8.49394 10.2943 7.27304 10.8 6 10.8ZM6 2.4C5.84087 2.4 5.68826 2.46321 5.57574 2.57574C5.46322 2.68826 5.4 2.84087 5.4 3V5.4H4.2C4.04087 5.4 3.88826 5.46321 3.77574 5.57573C3.66322 5.68826 3.6 5.84087 3.6 6C3.6 6.15913 3.66322 6.31174 3.77574 6.42426C3.88826 6.53678 4.04087 6.6 4.2 6.6H6C6.15913 6.6 6.31174 6.53678 6.42427 6.42426C6.53679 6.31174 6.6 6.15913 6.6 6V3C6.6 2.84087 6.53679 2.68826 6.42427 2.57574C6.31174 2.46321 6.15913 2.4 6 2.4Z" fill="black"/>
                    </svg>
                    <span>{time}</span>
                </div>
                <button type="button" className={clsx(s.metaItem, s.reviewLink)} onClick={onReview}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M9 2.99996H3C2.84087 2.99996 2.68826 3.06317 2.57574 3.17569C2.46321 3.28821 2.4 3.44082 2.4 3.59995C2.4 3.75908 2.46321 3.91169 2.57574 4.02421C2.68826 4.13673 2.84087 4.19994 3 4.19994H9C9.15913 4.19994 9.31174 4.13673 9.42426 4.02421C9.53679 3.91169 9.6 3.75908 9.6 3.59995C9.6 3.44082 9.53679 3.28821 9.42426 3.17569C9.31174 3.06317 9.15913 2.99996 9 2.99996ZM9 5.39992H3C2.84087 5.39992 2.68826 5.46314 2.57574 5.57566C2.46321 5.68818 2.4 5.84079 2.4 5.99992C2.4 6.15904 2.46321 6.31165 2.57574 6.42417C2.68826 6.53669 2.84087 6.59991 3 6.59991H9C9.15913 6.59991 9.31174 6.53669 9.42426 6.42417C9.53679 6.31165 9.6 6.15904 9.6 5.99992C9.6 5.84079 9.53679 5.68818 9.42426 5.57566C9.31174 5.46314 9.15913 5.39992 9 5.39992ZM10.2 0H1.8C1.32261 0 0.864773 0.18964 0.527208 0.5272C0.189642 0.864761 0 1.32259 0 1.79997V7.79989C0 8.27727 0.189642 8.7351 0.527208 9.07267C0.864773 9.41023 1.32261 9.59987 1.8 9.59987H8.754L10.974 11.8258C11.0301 11.8814 11.0966 11.9254 11.1697 11.9553C11.2428 11.9852 11.321 12.0003 11.4 11.9998C11.4787 12.0019 11.5568 11.9854 11.628 11.9518C11.7376 11.9068 11.8314 11.8304 11.8976 11.7322C11.9638 11.6339 11.9994 11.5183 12 11.3998V1.79997C12 1.32259 11.8104 0.864761 11.4728 0.5272C11.1352 0.18964 10.6774 0 10.2 0ZM10.8 9.95386L9.426 8.57388C9.36994 8.51827 9.30345 8.47428 9.23034 8.44442C9.15724 8.41456 9.07896 8.39943 9 8.39988H1.8C1.64087 8.39988 1.48826 8.33667 1.37574 8.22415C1.26321 8.11163 1.2 7.95902 1.2 7.79989V1.79997C1.2 1.64085 1.26321 1.48824 1.37574 1.37572C1.48826 1.2632 1.64087 1.19998 1.8 1.19998H10.2C10.3591 1.19998 10.5117 1.2632 10.6243 1.37572C10.7368 1.48824 10.8 1.64085 10.8 1.79997V9.95386Z" fill="black"/>
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
