'use client';

import React from 'react';
import clsx from 'clsx';
import s from './OrderStatusTimeline.module.scss';

export interface StatusStep {
    label: string;
    date: string;
    time: string;
    isCompleted: boolean;
    isCurrent?: boolean;
}

interface OrderStatusTimelineProps {
    steps: StatusStep[];
}

export default function OrderStatusTimeline({ steps }: OrderStatusTimelineProps) {
    return (
        <div className={s.timeline}>
            {steps.map((step, index) => (
                <div 
                    key={index} 
                    className={clsx(s.step, step.isCompleted && s.completed, step.isCurrent && s.current)}
                >
                    <div className={s.indicator}>
                        <div className={s.circle}>
                            {step.isCompleted ? (
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5.5 9.5L2 6L3 5L5.5 7.5L11 2L12 3L5.5 9.5Z" fill="white"/>
                                </svg>
                            ) : null}
                        </div>
                        {index < steps.length - 1 && <div className={s.line} />}
                    </div>
                    <div className={s.content}>
                        <p className={s.label}>{step.label}</p>
                        {step.date ? (
                            <p className={s.timestamp}>{step.date} {step.time}</p>
                        ) : null}
                    </div>
                </div>
            ))}
        </div>
    );
}
