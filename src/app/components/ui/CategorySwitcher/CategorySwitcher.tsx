'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import AppLink from '../AppLink/AppLink';
import s from './CategorySwitcher.module.scss';
import clsx from 'clsx';

interface CategoryItem {
    id: string;
    name: string;
    slug: string;
    href: string;
}

interface CategorySwitcherProps {
    title?: string;
    className?: string;
    isSidebar?: boolean;
    categoryId?: number;
    lang?: string;
}

export default function CategorySwitcher({
    title = 'КАТЕГОРІЇ',
    className,
    isSidebar = false,
    categoryId,
    lang = 'ua',
}: CategorySwitcherProps) {
    const [parent, setParent] = useState<CategoryItem | null>(null);
    const [siblings, setSiblings] = useState<CategoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!categoryId) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        fetch(`/api/catalog/filter-categories?categoryId=${categoryId}&lang=${lang}`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch filter categories");
                return res.json();
            })
            .then(data => {
                setParent(data.parent);
                setSiblings(data.siblings || []);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Error loading category filter data:", err);
                setIsLoading(false);
            });
    }, [categoryId, lang]);

    if (isLoading || (!parent && siblings.length === 0) || parent?.id === '768') {
        return null; // Or skeleton loader if preferred
    }

    return (
        <div className={clsx(s.wrapper, isSidebar && s.sidebarMode, className)}>
            {title && <h3 className={s.title}>{title}</h3>}
            <div className={s.list}>
                {/* 1. Parent Category Link with Back Arrow */}
                {parent && (
                    <AppLink
                        href={parent.href}
                        className={clsx(s.item, s.parent)}
                    >
                        <Image 
                            src="/images/icons/parent-catalog.png" 
                            alt="" 
                            width={20} 
                            height={20} 
                            className={s.parentIcon}
                        />
                        <span className={s.label}>{parent.name}</span>
                    </AppLink>
                )}

                {/* 2. Sibling Categories Links */}
                {siblings.map((sibling) => {
                    const isActive = sibling.id === String(categoryId);
                    return (
                        <AppLink
                            key={sibling.id}
                            href={sibling.href}
                            className={clsx(s.item, isActive && s.active)}
                        >
                            <span className={s.label}>{sibling.name}</span>
                        </AppLink>
                    );
                })}
            </div>
        </div>
    );
}
