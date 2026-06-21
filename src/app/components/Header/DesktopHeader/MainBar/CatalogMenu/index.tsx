"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import AppLink from "@/app/components/ui/AppLink/AppLink";
import clsx from "clsx";
import s from "./CatalogMenu.module.scss";
import { useScrollLock } from "@/hooks/useScrollLock";
import { getCategoryHref } from "@/utils/category-url";
import { ProductCategory } from "@/lib/graphql/queries/products";

interface CatalogMenuProps {
    isOpen: boolean;
    onClose: () => void;
    categories: ProductCategory[];
}

export default function CatalogMenu({ isOpen, onClose, categories }: CatalogMenuProps) {
    const [activeCategory, setActiveCategory] = useState<ProductCategory | null>(null);
    const [hoveredSubCategory, setHoveredSubCategory] = useState<ProductCategory | null>(null);
    const [hoveredThirdLevel, setHoveredThirdLevel] = useState<ProductCategory | null>(null);
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

    const hasThirdLevel = !!(hoveredSubCategory?.children && hoveredSubCategory.children.length > 0);

    return (
        <div className={s.overlay} onClick={onClose}>
            <div className={s.menuWrapper} onClick={(e) => e.stopPropagation()}>
                <div className={s.sidebar}>
                    <ul className={s.categoryList}>
                        {displayCategories.map((cat) => (
                            <li
                                key={cat.id}
                                className={clsx(s.categoryItem, activeCategory?.id === cat.id && s.active)}
                                onMouseEnter={() => {
                                    setActiveCategory(cat);
                                    setHoveredSubCategory(null);
                                    setHoveredThirdLevel(null);
                                }}
                            >
                                <AppLink
                                    href={getCategoryHref(cat)}
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
                        {/* Root category images */}
                        {displayCategories.map((cat) => (
                            cat.image?.big2x && (
                                <div
                                    key={cat.id}
                                    className={clsx(
                                        s.bgImageWrapper,
                                        activeCategory?.id === cat.id && s.visible,
                                        hoveredSubCategory?.image?.big2x && s.hiddenBySubHover
                                    )}
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

                        {/* L2 sub-category images */}
                        {activeCategory?.children?.map((sub) => (
                            sub.image?.big2x && (
                                <div
                                    key={sub.id}
                                    className={clsx(
                                        s.bgImageWrapper,
                                        hoveredSubCategory?.id === sub.id && !hoveredThirdLevel?.image?.big2x && s.visible
                                    )}
                                >
                                    <Image
                                        src={sub.image.big2x}
                                        alt=""
                                        fill
                                        className={s.bgImage}
                                    />
                                </div>
                            )
                        ))}

                        {/* L3 sub-sub-category images */}
                        {hoveredSubCategory?.children?.map((third) => (
                            third.image?.big2x && (
                                <div
                                    key={third.id}
                                    className={clsx(s.bgImageWrapper, hoveredThirdLevel?.id === third.id && s.visible)}
                                >
                                    <Image
                                        src={third.image.big2x}
                                        alt=""
                                        fill
                                        className={s.bgImage}
                                    />
                                </div>
                            )
                        ))}
                    </div>

                    {activeCategory && (
                        <div className={s.subContent}>
                            {activeCategory.children && activeCategory.children.length > 0 && (
                                <div
                                    className={s.subColumns}
                                    onMouseLeave={() => {
                                        setHoveredSubCategory(null);
                                        setHoveredThirdLevel(null);
                                    }}
                                >
                                    {/* ── Колонка L2 ── */}
                                    <ul className={clsx(s.subList, hasThirdLevel && s.subListNarrow)}>
                                        {activeCategory.children.map((sub) => {
                                            const hasChildren = !!(sub.children && sub.children.length > 0);
                                            return (
                                                <li
                                                    key={sub.id}
                                                    className={clsx(s.subItem, hoveredSubCategory?.id === sub.id && s.subItemActive)}
                                                    onMouseEnter={() => {
                                                        setHoveredSubCategory(sub);
                                                        setHoveredThirdLevel(null);
                                                    }}
                                                >
                                                    <AppLink
                                                        href={getCategoryHref(sub, activeCategory)}
                                                        className={s.subLink}
                                                        onClick={onClose}
                                                    >
                                                        <span className={s.subTitleText}>{sub.name}</span>
                                                    </AppLink>
                                                </li>
                                            );
                                        })}
                                    </ul>

                                    {/* ── Колонка L3 ── */}
                                    {hasThirdLevel && (
                                        <ul className={s.thirdList}>
                                            {hoveredSubCategory!.children!.map((third) => (
                                                <li
                                                    key={third.id}
                                                    className={clsx(s.thirdItem, hoveredThirdLevel?.id === third.id && s.thirdItemActive)}
                                                    onMouseEnter={() => setHoveredThirdLevel(third)}
                                                >
                                                    <AppLink
                                                        href={getCategoryHref(third, hoveredSubCategory, activeCategory)}
                                                        className={s.thirdLink}
                                                        onClick={onClose}
                                                    >
                                                        {third.name}
                                                    </AppLink>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
