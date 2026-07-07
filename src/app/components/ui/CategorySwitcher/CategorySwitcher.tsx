'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import AppLink from '../AppLink/AppLink';
import s from './CategorySwitcher.module.scss';
import clsx from 'clsx';
import Spinner from '../Spinner/Spinner';
import { getCategoryByIdApi, getSubcategoriesApi, getCatalogTreeApi } from '@/lib/graphql/queries/products';
import { buildCategoryIndex, getCategoryHref } from '@/utils/category-url';

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
    isSubcategory?: boolean;
}

export default function CategorySwitcher({
    title = 'КАТЕГОРІЇ',
    className,
    isSidebar = false,
    categoryId,
    lang = 'ua',
    isSubcategory = false,
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

        (async () => {
            try {
                const [category, catalogTree] = await Promise.all([
                    getCategoryByIdApi(categoryId, lang),
                    getCatalogTreeApi(lang),
                ]);

                if (!category) {
                    setIsLoading(false);
                    return;
                }

                const categoryIndex = buildCategoryIndex(catalogTree);

                const getHref = (id: string | number): string => {
                    const entry = categoryIndex.get(String(id));
                    if (!entry) return '';
                    const rawHref = getCategoryHref(entry.node, entry.parent, entry.grandParent);
                    return lang === 'ru' ? `/ru${rawHref}` : rawHref;
                };

                const parentId = category.parentId;

                if (parentId && parentId !== 768) {
                    const [parentData, siblingsData] = await Promise.all([
                        getCategoryByIdApi(parentId, lang),
                        getSubcategoriesApi(parentId, lang),
                    ]);

                    setParent(parentData ? {
                        id: parentData.id,
                        name: parentData.name,
                        slug: parentData.slug,
                        href: getHref(parentData.id),
                    } : null);

                    setSiblings(siblingsData.map(sib => ({
                        id: sib.id,
                        name: sib.name,
                        slug: sib.slug,
                        href: getHref(sib.id),
                    })));
                } else {
                    setParent({
                        id: '768',
                        name: 'Каталог',
                        slug: '',
                        href: lang === 'ru' ? '/ru' : '/',
                    });

                    const siblingsData = await getSubcategoriesApi(768, lang);
                    setSiblings(siblingsData.map(sib => ({
                        id: sib.id,
                        name: sib.name,
                        slug: sib.slug,
                        href: getHref(sib.id),
                    })));
                }
            } catch (err) {
                console.error('Error loading category switcher data:', err);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [categoryId, lang]);

    if (isLoading) {
        if (isSubcategory) {
            return (
                <div className={clsx(s.wrapper, isSidebar && s.sidebarMode, className)}>
                    {title && <h3 className={s.title}>{title}</h3>}
                    <Spinner centered={true} />
                </div>
            );
        }
        return null;
    }

    if ((!parent && siblings.length === 0) || parent?.id === '768') {
        return null;
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
