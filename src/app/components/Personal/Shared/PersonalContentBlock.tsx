'use client';

import React from 'react';
import s from '@/app/[lang]/personal/PersonalLayout.module.scss';
import clsx from 'clsx';

interface PersonalContentBlockProps {
    children: React.ReactNode;
    className?: string;
}

export default function PersonalContentBlock({ children, className }: PersonalContentBlockProps) {
    return (
        <div className={clsx(s.contentBlock, className)}>
            {children}
        </div>
    );
}
