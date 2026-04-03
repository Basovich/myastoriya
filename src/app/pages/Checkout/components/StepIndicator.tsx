'use client';

import React from 'react';
import clsx from 'clsx';
import s from './CheckoutShared.module.scss';

interface StepIndicatorProps {
    current: number;
}

export default function StepIndicator({ current }: StepIndicatorProps) {
    const steps = [
        { num: 1, label: 'Крок 1' },
        { num: 2, label: 'Крок 2' },
        { num: 3, label: 'Крок 3' },
    ];

    return (
        <div className={s.stepIndicator}>
            {steps.map((step, idx) => (
                <React.Fragment key={step.num}>
                    <div className={s.stepItem}>
                        <div
                            className={clsx(s.stepCircle, {
                                [s.stepCircleActive]: current === step.num,
                                [s.stepCircleDone]: current > step.num,
                            })}
                        >
                            {current > step.num ? (
                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                    <path
                                        d="M1 3.5L3.8 6.5L9 1"
                                        stroke="white"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            ) : (
                                step.num
                            )}
                        </div>
                        <span
                            className={clsx(s.stepLabel, {
                                [s.stepLabelActive]: current === step.num,
                            })}
                        >
                            {step.label}
                        </span>
                    </div>
                    {idx < steps.length - 1 && (
                        <div
                            className={clsx(s.stepLine, {
                                [s.stepLineDone]: current > step.num,
                            })}
                        />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}
