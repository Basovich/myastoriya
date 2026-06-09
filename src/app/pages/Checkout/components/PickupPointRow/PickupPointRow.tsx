'use client';

import React from 'react';
import clsx from 'clsx';
import Image from 'next/image';
import s from './PickupPointRow.module.scss';
import { UserPickupPoint, Shop } from '@/lib/graphql';

interface PickupPointRowProps {
    points: UserPickupPoint[];
    shops: Shop[];
    selectedShopId: string | null;
    onSelect: (shopId: string) => void;
    onAddClick: () => void;
    lang: 'ua' | 'ru';
}

function PickupPointCard({
    point,
    shops,
    isSelected,
    onSelect,
    lang
}: {
    point: UserPickupPoint;
    shops: Shop[];
    isSelected: boolean;
    onSelect: (shopId: string) => void;
    lang: 'ua' | 'ru';
}) {
    const matchedShop = shops.find(s => s.name === point.name || s.siteName === point.name);
    
    const displayAddress = (() => {
        if (matchedShop?.siteAddress) return matchedShop.siteAddress;
        
        const parenMatch = point.name.match(/^(.*?)\((.*?)\)$/);
        if (parenMatch) return parenMatch[2].trim();
        
        const commaIndex = point.name.indexOf(',');
        if (commaIndex !== -1) return point.name.slice(commaIndex + 1).trim();
        
        return point.name;
    })();

    const shopSchedule = (matchedShop?.schedule && matchedShop.schedule.length > 0) 
        ? matchedShop.schedule 
        : point.schedule;
        
    const scheduleText = shopSchedule && shopSchedule.length > 0
        ? shopSchedule.map(s => `${s.days}: ${s.workTime}`).join(', ')
        : '';

    const title = lang === 'ua' ? "Заклад М'ясторія" : "Заведение М'ясторія";

    const handleCardClick = () => {
        if (matchedShop) {
            onSelect(matchedShop.id.toString());
        } else {
            // Fallback if no exact shop match
            onSelect(point.id);
        }
    };

    return (
        <div 
            className={clsx(s.pickupCard, isSelected && s.pickupCardActive)}
            onClick={handleCardClick}
        >
            <div className={s.cardHeader}>
                <span className={s.cardTitle}>{title}</span>
                <div className={s.storeLogo}>
                    <Image 
                        src="/icons/logo-red.svg" 
                        alt="Logo" 
                        width={14} 
                        height={14} 
                    />
                </div>
            </div>
            <div className={s.cardBody}>
                <span className={s.cardAddress}>{displayAddress}</span>
                {scheduleText && <span className={s.cardSchedule}>{scheduleText}</span>}
            </div>
        </div>
    );
}

function AddPickupPointCard({ onClick, lang }: { onClick: () => void; lang: 'ua' | 'ru' }) {
    const label = lang === 'ua' ? 'Обрати заклад' : 'Выбрать заведение';
    return (
        <button className={s.addPickupCard} type="button" onClick={onClick}>
            <div className={s.plusCircle}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1V13M1 7H13" stroke="#999" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </div>
            <span>{label}</span>
        </button>
    );
}

export default function PickupPointRow({
    points,
    shops,
    selectedShopId,
    onSelect,
    onAddClick,
    lang
}: PickupPointRowProps) {
    return (
        <div className={s.pickupRow}>
            {points.map(point => {
                const matchedShop = shops.find(s => s.name === point.name || s.siteName === point.name);
                const isSelected = matchedShop ? selectedShopId === matchedShop.id.toString() : selectedShopId === point.id;
                
                return (
                    <PickupPointCard
                        key={point.id}
                        point={point}
                        shops={shops}
                        isSelected={isSelected}
                        onSelect={onSelect}
                        lang={lang}
                    />
                );
            })}
            <AddPickupPointCard onClick={onAddClick} lang={lang} />
        </div>
    );
}
