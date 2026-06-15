'use client';

import React from 'react';
import Image from 'next/image';
import Button from '@/app/components/ui/Button/Button';
import { ShoppingListProduct } from '@/lib/graphql/queries/pages/shoppingList';
import s from './ShoppingListCard.module.scss';
import clsx from 'clsx';

interface ShoppingListCardProps {
    name: string;
    date: string;
    products: ShoppingListProduct[];
    totalSum: number;
    sumLabel: string;
    onEdit: () => void;
    onAddToCart: () => void;
    onDelete: () => void;
}

export default function ShoppingListCard({
    name,
    date,
    products,
    totalSum,
    sumLabel,
    onEdit,
    onAddToCart,
    onDelete
}: ShoppingListCardProps) {

    const renderProductsList = (maxItems: number) => {
        const visibleProducts = products.slice(0, maxItems);
        const hasMore = products.length > maxItems;

        return visibleProducts.map((prod, index) => {
            const imgUrl = prod.image
                ? (prod.image.grid2x || prod.image.main2x || prod.image.grid1x || prod.image.main1x || prod.image.big || '')
                : '';
            const resolvedImg = imgUrl.startsWith('/')
                ? `https://dev-api.myastoriya.com.ua${imgUrl}`
                : imgUrl || '/images/product-placeholder.svg';

            const isLastWithOverlay = hasMore && index === maxItems - 1;
            const remainingCount = products.length - (maxItems - 1);

            return (
                <div key={prod.id || index} className={s.productThumb}>
                    <Image src={resolvedImg} alt={prod.name || "Product"} width={56} height={42} />
                    {isLastWithOverlay && (
                        <div className={s.overlay}>
                            <span>{remainingCount}</span>
                        </div>
                    )}
                </div>
            );
        });
    };

    return (
        <div className={s.card}>
            <div className={s.header}>
                <div className={s.titleBlock}>
                    <h3 className={s.name}>{name}</h3>
                    <div className={clsx(s.date, s.mobileDate)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none">
                            <path d="M9.35 1.1H8.25V0.55C8.25 0.404131 8.19205 0.264236 8.08891 0.161091C7.98576 0.0579462 7.84587 0 7.7 0C7.55413 0 7.41424 0.0579462 7.31109 0.161091C7.20795 0.264236 7.15 0.404131 7.15 0.55V1.1H3.85V0.55C3.85 0.404131 3.79205 0.264236 3.68891 0.161091C3.58576 0.0579462 3.44587 0 3.3 0C3.15413 0 3.01424 0.0579462 2.91109 0.161091C2.80795 0.264236 2.75 0.404131 2.75 0.55V1.1H1.65C1.21239 1.1 0.792709 1.27384 0.483274 1.58327C0.173839 1.89271 0 2.31239 0 2.75V9.35C0 9.78761 0.173839 10.2073 0.483274 10.5167C0.792709 10.8262 1.21239 11 1.65 11H9.35C9.78761 11 10.2073 10.8262 10.5167 10.5167C10.8262 10.2073 11 9.78761 11 9.35V2.75C11 2.31239 10.8262 1.89271 10.5167 1.58327C10.2073 1.27384 9.78761 1.1 9.35 1.1ZM9.9 9.35C9.9 9.49587 9.84205 9.63576 9.73891 9.73891C9.63576 9.84205 9.49587 9.9 9.35 9.9H1.65C1.50413 9.9 1.36424 9.84205 1.26109 9.73891C1.15795 9.63576 1.1 9.49587 1.1 9.35V5.5H9.9V9.35ZM9.9 4.4H1.1V2.75C1.1 2.60413 1.15795 2.46424 1.26109 2.36109C1.36424 2.25795 1.50413 2.2 1.65 2.2H2.75V2.75C2.75 2.89587 2.80795 3.03576 2.91109 3.13891C3.01424 3.24205 3.15413 3.3 3.3 3.3C3.44587 3.3 3.58576 3.24205 3.68891 3.13891C3.79205 3.03576 3.85 2.89587 3.85 2.75V2.2H7.15V2.75C7.15 2.89587 7.20795 3.03576 7.31109 3.13891C7.41424 3.24205 7.55413 3.3 7.7 3.3C7.84587 3.3 7.98576 3.24205 8.08891 3.13891C8.19205 3.03576 8.25 2.89587 8.25 2.75V2.2H9.35C9.49587 2.2 9.63576 2.25795 9.73891 2.36109C9.84205 2.46424 9.9 2.60413 9.9 2.75V4.4Z" fill="black"/>
                        </svg>
                        <span>{date}</span>
                    </div>
                </div>

                <div className={s.headerRight}>
                    <div className={clsx(s.date, s.desktopDate)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none">
                            <path d="M9.35 1.1H8.25V0.55C8.25 0.404131 8.19205 0.264236 8.08891 0.161091C7.98576 0.0579462 7.84587 0 7.7 0C7.55413 0 7.41424 0.0579462 7.31109 0.161091C7.20795 0.264236 7.15 0.404131 7.15 0.55V1.1H3.85V0.55C3.85 0.404131 3.79205 0.264236 3.68891 0.161091C3.58576 0.0579462 3.44587 0 3.3 0C3.15413 0 3.01424 0.0579462 2.91109 0.161091C2.80795 0.264236 2.75 0.404131 2.75 0.55V1.1H1.65C1.21239 1.1 0.792709 1.27384 0.483274 1.58327C0.173839 1.89271 0 2.31239 0 2.75V9.35C0 9.78761 0.173839 10.2073 0.483274 10.5167C0.792709 10.8262 1.21239 11 1.65 11H9.35C9.78761 11 10.2073 10.8262 10.5167 10.5167C10.8262 10.2073 11 9.78761 11 9.35V2.75C11 2.31239 10.8262 1.89271 10.5167 1.58327C10.2073 1.27384 9.78761 1.1 9.35 1.1ZM9.9 9.35C9.9 9.49587 9.84205 9.63576 9.73891 9.73891C9.63576 9.84205 9.49587 9.9 9.35 9.9H1.65C1.50413 9.9 1.36424 9.84205 1.26109 9.73891C1.15795 9.63576 1.1 9.49587 1.1 9.35V5.5H9.9V9.35ZM9.9 4.4H1.1V2.75C1.1 2.60413 1.15795 2.46424 1.26109 2.36109C1.36424 2.25795 1.50413 2.2 1.65 2.2H2.75V2.75C2.75 2.89587 2.80795 3.03576 2.91109 3.13891C3.01424 3.24205 3.15413 3.3 3.3 3.3C3.44587 3.3 3.58576 3.24205 3.68891 3.13891C3.79205 3.03576 3.85 2.89587 3.85 2.75V2.2H7.15V2.75C7.15 2.89587 7.20795 3.03576 7.31109 3.13891C7.41424 3.24205 7.55413 3.3 7.7 3.3C7.84587 3.3 7.98576 3.24205 8.08891 3.13891C8.19205 3.03576 8.25 2.89587 8.25 2.75V2.2H9.35C9.49587 2.2 9.63576 2.25795 9.73891 2.36109C9.84205 2.46424 9.9 2.60413 9.9 2.75V4.4Z" fill="black"/>
                        </svg>
                        <span>{date}</span>
                    </div>

                    <button className={s.deleteBtn} onClick={onDelete} aria-label="Видалити список">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="13" viewBox="0 0 12 13" fill="none">
                            <path d="M4.66667 10.4C4.84348 10.4 5.01305 10.3315 5.13807 10.2096C5.2631 10.0877 5.33333 9.92239 5.33333 9.75V5.85C5.33333 5.67761 5.2631 5.51228 5.13807 5.39038C5.01305 5.26848 4.84348 5.2 4.66667 5.2C4.48986 5.2 4.32029 5.26848 4.19526 5.39038C4.07024 5.51228 4 5.67761 4 5.85V9.75C4 9.92239 4.07024 10.0877 4.19526 10.2096C4.32029 10.3315 4.48986 10.4 4.66667 10.4ZM11.3333 2.6H8.66667V1.95C8.66667 1.43283 8.45595 0.936838 8.08088 0.571142C7.70581 0.205446 7.1971 0 6.66667 0H5.33333C4.8029 0 4.29419 0.205446 3.91912 0.571142C3.54405 0.936838 3.33333 1.43283 3.33333 1.95V2.6H0.666667C0.489856 2.6 0.320286 2.66848 0.195262 2.79038C0.0702379 2.91228 0 3.07761 0 3.25C0 3.42239 0.0702379 3.58772 0.195262 3.70962C0.320286 3.83152 0.489856 3.9 0.666667 3.9H1.33333V11.05C1.33333 11.5672 1.54405 12.0632 1.91912 12.4289C2.29419 12.7946 2.8029 13 3.33333 13H8.66667C9.1971 13 9.70581 12.7946 10.0809 12.4289C10.456 12.0632 10.6667 11.5672 10.6667 11.05V3.9H11.3333C11.5101 3.9 11.6797 3.83152 11.8047 3.70962C11.9298 3.58772 12 3.42239 12 3.25C12 3.07761 11.9298 2.91228 11.8047 2.79038C11.6797 2.66848 11.5101 2.6 11.3333 2.6ZM4.66667 1.95C4.66667 1.77761 4.7369 1.61228 4.86193 1.49038C4.98695 1.36848 5.15652 1.3 5.33333 1.3H6.66667C6.84348 1.3 7.01305 1.36848 7.13807 1.49038C7.2631 1.61228 7.33333 1.77761 7.33333 1.95V2.6H4.66667V1.95ZM9.33333 11.05C9.33333 11.2224 9.2631 11.3877 9.13807 11.5096C9.01305 11.6315 8.84348 11.7 8.66667 11.7H3.33333C3.15652 11.7 2.98695 11.6315 2.86193 11.5096C2.7369 11.3877 2.66667 11.2224 2.66667 11.05V3.9H9.33333V11.05ZM7.33333 10.4C7.51014 10.4 7.67971 10.3315 7.80474 10.2096C7.92976 10.0877 8 9.92239 8 9.75V5.85C8 5.67761 7.92976 5.51228 7.80474 5.39038C7.67971 5.26848 7.51014 5.2 7.33333 5.2C7.15652 5.2 6.98695 5.26848 6.86193 5.39038C6.73691 5.51228 6.66667 5.67761 6.66667 5.85V9.75C6.66667 9.92239 6.73691 10.0877 6.86193 10.2096C6.98695 10.3315 7.15652 10.4 7.33333 10.4Z" fill="black"/>
                        </svg>
                    </button>
                </div>
            </div>

            <div className={clsx(s.productsRow, s.mobileOnly)}>
                <div className={s.productsList}>
                    {renderProductsList(4)}
                </div>
            </div>

            <div className={clsx(s.productsRow, s.desktopOnly)}>
                <div className={s.productsList}>
                    {renderProductsList(12)}
                </div>
            </div>

            <div className={s.footer}>
                <div className={s.sumBlock}>
                    <span className={s.sumLabel}>{sumLabel}</span>
                    <span className={s.sumValue}>
                        {totalSum.toLocaleString()} <span>₴</span>
                    </span>
                </div>
                <div className={s.actions}>
                    <Button onClick={onEdit} variant="outline-black" className={s.actionBtn}>
                        РЕДАКТУВАТИ СПИСОК
                    </Button>
                    <Button onClick={onAddToCart} variant="red" className={s.actionBtn}>
                        ДОДАТИ ДО КОШИКА
                    </Button>
                </div>
            </div>
        </div>
    );
}
