"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import AppLink from "@/app/components/ui/AppLink/AppLink";
import clsx from "clsx";
import s from "./CatalogMenu.module.scss";
import { useScrollLock } from "@/hooks/useScrollLock";
import { getCategoryHref } from "@/utils/category-url";
import { ProductCategory } from "@/lib/graphql/queries/products";
import { useParams, usePathname } from "next/navigation";
import { Locale } from "@/i18n/config";
import { getLocalizedHref } from "@/utils/i18n-helpers";

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
    
    const params = useParams();
    const pathname = usePathname();
    const lang = (params.lang as Locale) || "ua";

    // Data Cleanup & Smart flattening memoized to prevent infinite updates in useEffect
    const displayCategories = useMemo(() => {
        const allChildIds = new Set(categories.flatMap(cat => (cat.children || []).map(child => child.id)));
        const uniqueRootCategories = categories.filter(cat => !allChildIds.has(cat.id));

        const isDeepRoot = uniqueRootCategories.length <= 3 && uniqueRootCategories.every(c => c.children && c.children.length > 0);
        return isDeepRoot
            ? uniqueRootCategories.flatMap(cat => cat.children || [])
            : uniqueRootCategories;
    }, [categories]);

    // Reset states when menu is closed so it starts fresh with only L1 categories next time
    useEffect(() => {
        if (!isOpen) {
            setActiveCategory(null);
            setHoveredSubCategory(null);
            setHoveredThirdLevel(null);
        }
    }, [isOpen]);

    // Close on ESC
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as any).activeCategory = activeCategory;
        }
    }, [activeCategory]);

    // Scroll Lock using hook
    useEffect(() => {
        if (isOpen) {
            disableScroll();
            return () => enableScroll();
        }
    }, [isOpen, disableScroll, enableScroll]);

    // Resolve the ID of the category whose image should be shown based on priority/nesting fallback
    const currentVisibleImageCategoryId = useMemo(() => {
        if (hoveredThirdLevel && hoveredThirdLevel.image?.big2x) {
            return hoveredThirdLevel.id;
        }
        if (hoveredSubCategory && hoveredSubCategory.image?.big2x) {
            return hoveredSubCategory.id;
        }
        if (activeCategory && activeCategory.image?.big2x) {
            return activeCategory.id;
        }
        return null;
    }, [hoveredThirdLevel, hoveredSubCategory, activeCategory]);

    if (!isOpen) return null;

    const hasThirdLevel = !!(hoveredSubCategory?.children && hoveredSubCategory.children.length > 0);

    return (
        <div className={s.overlay} onClick={onClose}>
            <div className={s.menuWrapper} onClick={(e) => e.stopPropagation()}>
                <div className={s.sidebar}>
                    <ul className={s.categoryList}>
                        {displayCategories.map((cat) => {
                            const canonicalHref = getCategoryHref(cat);
                            const localizedHref = getLocalizedHref(canonicalHref, lang);
                            const isCurrentL1 = pathname === localizedHref;
                            return (
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
                                        href={canonicalHref}
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
                                        <span className={clsx(s.catTitle, isCurrentL1 && s.current)}>{cat.name}</span>
                                    </AppLink>
                                </li>
                            );
                        })}
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
                                        currentVisibleImageCategoryId === cat.id && s.visible
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
                                        currentVisibleImageCategoryId === sub.id && s.visible
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
                                    className={clsx(
                                        s.bgImageWrapper,
                                        currentVisibleImageCategoryId === third.id && s.visible
                                    )}
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
                                            const canonicalHref = getCategoryHref(sub, activeCategory);
                                            const localizedHref = getLocalizedHref(canonicalHref, lang);
                                            const isCurrentL2 = pathname === localizedHref;
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
                                                        href={canonicalHref}
                                                        className={s.subLink}
                                                        onClick={onClose}
                                                    >
                                                        <span className={clsx(s.subTitleText, isCurrentL2 && s.current)}>{sub.name}</span>
                                                    </AppLink>
                                                </li>
                                            );
                                        })}
                                    </ul>

                                    {/* ── Колонка L3 ── */}
                                    {hasThirdLevel && (
                                        <ul className={s.thirdList}>
                                            {hoveredSubCategory!.children!.map((third) => {
                                                const canonicalHref = getCategoryHref(third, hoveredSubCategory, activeCategory);
                                                const localizedHref = getLocalizedHref(canonicalHref, lang);
                                                const isCurrentL3 = pathname === localizedHref;
                                                return (
                                                    <li
                                                        key={third.id}
                                                        className={clsx(s.thirdItem, hoveredThirdLevel?.id === third.id && s.thirdItemActive)}
                                                        onMouseEnter={() => setHoveredThirdLevel(third)}
                                                    >
                                                        <AppLink
                                                            href={canonicalHref}
                                                            className={clsx(s.thirdLink, isCurrentL3 && s.current)}
                                                            onClick={onClose}
                                                        >
                                                            {third.name}
                                                        </AppLink>
                                                    </li>
                                                );
                                            })}
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
