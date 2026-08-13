'use client';

import React from 'react';
import clsx from 'clsx';
import s from '../PickupPointRow/PickupPointRow.module.scss';
import { UserPickupPoint } from '@/lib/graphql';

interface NpPickupPointRowProps {
    points: UserPickupPoint[];
    selectedNPRef: string;
    onSelect: (point: UserPickupPoint) => void;
    onAddClick: () => void;
    lang: 'ua' | 'ru';
}

function NpPickupPointCard({
    point,
    isSelected,
    onSelect,
    lang,
}: {
    point: UserPickupPoint;
    isSelected: boolean;
    onSelect: () => void;
    lang: 'ua' | 'ru';
}) {
    const title = lang === 'ua' ? 'Нова Пошта' : 'Новая Почта';

    const scheduleText = point.schedule && point.schedule.length > 0
        ? point.schedule.map(sc => `${sc.days}: ${sc.workTime}`).join(', ')
        : '';

    return (
        <div 
            className={clsx(
                s.pickupCard, 
                isSelected && s.pickupCardActive
            )}
            onClick={onSelect}
        >
            <div className={s.cardHeader}>
                <div className={s.headerLeft}>
                    <span className={s.cardTitle}>{title}</span>
                </div>
                <div className={s.storeLogo}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="24" height="24" rx="4" fill="#ED1C24" />
                        <text
                            x="12"
                            y="18"
                            textAnchor="middle"
                            fontFamily="Arial, Helvetica, sans-serif"
                            fontWeight="900"
                            fontSize="17"
                            fill="white"
                        >Н</text>
                    </svg>
                </div>
            </div>
            <div className={s.cardBody}>
                <span className={s.cardAddress}>{point.name}</span>
                {point.schedule && point.schedule.length > 0 && (
                    <div className={s.cardSchedule}>
                        {point.schedule.map((sc, idx) => (
                            <div key={idx} className={s.scheduleItem}>
                                {sc.days}: {sc.workTime}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function AddNpPickupPointCard({ onClick, lang }: { onClick: () => void; lang: 'ua' | 'ru' }) {
    const label = lang === 'ua' ? 'Обрати відділення' : 'Выбрать отделение';
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

export default function NpPickupPointRow({
    points,
    selectedNPRef,
    onSelect,
    onAddClick,
    lang,
}: NpPickupPointRowProps) {
    return (
        <div className={s.pickupRow}>
            {points.map(point => {
                const isSelected = selectedNPRef === point.name || selectedNPRef === point.id;
                return (
                    <NpPickupPointCard
                        key={point.id}
                        point={point}
                        isSelected={isSelected}
                        onSelect={() => onSelect(point)}
                        lang={lang}
                    />
                );
            })}
            <AddNpPickupPointCard onClick={onAddClick} lang={lang} />
        </div>
    );
}
