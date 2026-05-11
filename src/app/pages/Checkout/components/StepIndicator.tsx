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
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="11" viewBox="0 0 14 11" fill="none">
                                        <path d="M5 10.42L0 5.42L1.41 4.01L5 7.59L12.59 0L14 1.42L5 10.42Z" fill="white"/>
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
