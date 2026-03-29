'use client';

import React from 'react';
import AppLink from '../AppLink/AppLink';
import s from './CategorySwitcher.module.scss';
import clsx from 'clsx';

const categories = [
    { id: 'parent', label: 'Ресторанне меню', href: '#', isParent: true },
    { id: '1', label: 'Салати', href: '#' },
    { id: '2', label: 'Холодні закуски', href: '#' },
    { id: '3', label: 'Гарячі закуски', href: '#', isActive: true },
    { id: '4', label: 'Перші страви', href: '#' },
    { id: '5', label: 'Основні страви', href: '#' },
    { id: '6', label: 'Гарніри', href: '#' },
    { id: '7', label: 'Соуси (30 г)', href: '#' },
    { id: '8', label: 'Десерти', href: '#' },
];

interface Category {
    id: string;
    label: string;
    href: string;
    isActive?: boolean;
    isParent?: boolean;
}

interface CategorySwitcherProps {
    title?: string;
    className?: string;
    isSidebar?: boolean;
}

export default function CategorySwitcher({
    title = 'КАТЕГОРІЇ',
    className,
    isSidebar = false,
}: CategorySwitcherProps) {
    return (
        <div className={clsx(s.wrapper, isSidebar && s.sidebarMode, className)}>
            {title && <h3 className={s.title}>{title}</h3>}
            <div className={s.list}>
                {categories.map((category) => (
                    <AppLink
                        key={category.id}
                        href={category.href}
                        className={clsx(
                            s.item,
                            category.isActive && s.active,
                            category.isParent && s.parent
                        )}
                    >
                        {category.isParent && (
                            <svg className={s.backIcon} width="20" height="12" viewBox="0 0 20 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 6L1 6M1 6L6.5 11M1 6L6.5 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        )}
                        <span className={s.label}>{category.label}</span>
                    </AppLink>
                ))}
            </div>
        </div>
    );
}
