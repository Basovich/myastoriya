"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import AppLink from "@/app/components/ui/AppLink/AppLink";
import clsx from "clsx";
import s from "./CatalogMenu.module.scss";
import { useScrollLock } from "@/hooks/useScrollLock";

interface Category {
    id: string;
    name: string;
    slug: string;
    menuIcon?: {
        icon1x: string | null;
        icon2x: string | null;
        icon3x: string | null;
    } | null;
    image?: {
        big1x: string | null;
        big2x: string | null;
    } | null;
    children?: Category[];
}

interface CatalogMenuProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
}

export default function CatalogMenu({ isOpen, onClose, categories }: CatalogMenuProps) {
    const [activeCategory, setActiveCategory] = useState<Category | null>(null);
    const { disableScroll, enableScroll } = useScrollLock();

    // Data Cleanup: Some categories in the API are both roots and children.
    // We filter out any root categories that already appear as children of another root.
    const allChildIds = new Set(categories.flatMap(cat => (cat.children || []).map(child => child.id)));
    const uniqueRootCategories = categories.filter(cat => !allChildIds.has(cat.id));

    // Smart flattening: If we have very few roots (like Raw/Ready), take their children.
    const isDeepRoot = uniqueRootCategories.length <= 3 && uniqueRootCategories.every(c => c.children && c.children.length > 0);
    const displayCategories = isDeepRoot 
        ? uniqueRootCategories.flatMap(cat => cat.children || [])
        : uniqueRootCategories;

    // Set initial active category when displayCategories are loaded
    useEffect(() => {
        if (displayCategories.length > 0 && !activeCategory) {
            setActiveCategory(displayCategories[0]);
        }
    }, [displayCategories, activeCategory]);

    // Close on ESC
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    // Scroll Lock using hook
    useEffect(() => {
        if (isOpen) {
            disableScroll();
            return () => enableScroll();
        }
    }, [isOpen, disableScroll, enableScroll]);

    if (!isOpen) return null;

    return (
        <div className={s.overlay} onClick={onClose}>
            <div className={s.menuWrapper} onClick={(e) => e.stopPropagation()}>
                <div className={s.sidebar}>
                    <ul className={s.categoryList}>
                        {displayCategories.map((cat) => (
                            <li
                                key={cat.id}
                                className={clsx(s.categoryItem, activeCategory?.id === cat.id && s.active)}
                                onMouseEnter={() => setActiveCategory(cat)}
                            >
                                <AppLink
                                    href={`/catalog/${cat.slug}`}
                                    className={s.categoryLink}
                                    onClick={onClose}
                                >
                                    <div className={s.iconWrapper}>
                                        {cat.menuIcon?.icon1x ? (
                                            <Image
                                                src={cat.menuIcon.icon1x}
                                                alt={cat.name}
                                                width={16}
                                                height={16}
                                                className={s.icon}
                                            />
                                        ) : cat.image?.big1x ? (
                                            <Image
                                                src={cat.image.big1x}
                                                alt={cat.name}
                                                width={16}
                                                height={16}
                                                className={s.icon}
                                            />
                                        ) : (
                                            <Image
                                                src="/icons/icon-category.svg"
                                                alt=""
                                                width={16}
                                                height={16}
                                                className={s.icon}
                                            />
                                        )}
                                    </div>
                                    <span className={s.catTitle}>{cat.name}</span>
                                </AppLink>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className={s.content}>
                    <div className={s.bgImagesContainer}>
                        {displayCategories.map((cat) => (
                            cat.image?.big2x && (
                                <div 
                                    key={cat.id} 
                                    className={clsx(s.bgImageWrapper, activeCategory?.id === cat.id && s.visible)}
                                >
                                    <Image
                                        src={cat.image.big2x}
                                        alt=""
                                        fill
                                        className={s.bgImage}
                                        priority={activeCategory?.id === cat.id}
                                    />
                                </div>
                            )
                        ))}
                    </div>

                    {activeCategory && (
                        <div className={s.subContent}>
                            {activeCategory.children && activeCategory.children.length > 0 && (
                                <ul className={s.subList}>
                                    {activeCategory.children.map((sub) => (
                                        <li key={sub.id} className={s.subItem}>
                                            <AppLink
                                                href={`/catalog/${sub.slug}`}
                                                className={s.subLink}
                                                onClick={onClose}
                                            >
                                                <span className={s.subTitleText}>{sub.name}</span>
                                            </AppLink>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
