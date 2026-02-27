"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import s from "./CatalogMenu.module.scss";
import { useScrollLock } from "@/hooks/useScrollLock";

interface Category {
    id: string;
    title: string;
    icon?: string;
    bgImage?: string;
    subcategories?: { title: string; href: string; icon?: string }[];
}

const CATALOG_DATA: Category[] = [
    {
        id: "summer",
        title: "Літнє меню",
        icon: "/icons/icon-category.svg",
        bgImage: "/images/catalog-bg.png",
        subcategories: [
            { title: "Окрошка", href: "#", icon: "/icons/icon-category.svg" },
            { title: "Салат з полуницею", href: "#", icon: "/icons/icon-category.svg" },
            { title: "Лимонад", href: "#", icon: "/icons/icon-category.svg" },
        ]
    },
    {
        id: "takeaway",
        title: "Візьми з собою",
        icon: "/icons/icon-category.svg",
        bgImage: "/images/catalog-bg.png",
        subcategories: [
            { title: "Ланч бокси", href: "#", icon: "/icons/icon-category.svg" },
            { title: "Кава з собою", href: "#", icon: "/icons/icon-category.svg" },
            { title: "Сендвічі", href: "#", icon: "/icons/icon-category.svg" },
        ]
    },
    {
        id: "sets",
        title: "Набори для компаній",
        icon: "/icons/icon-category.svg",
        bgImage: "/images/cat-sets.png",
        subcategories: [
            { title: "М'ясний сет", href: "#", icon: "/icons/icon-category.svg" },
            { title: "Сет закусок", href: "#", icon: "/icons/icon-category.svg" },
            { title: "Гриль сет", href: "#", icon: "/icons/icon-category.svg" },
        ]
    },
    {
        id: "grill",
        title: "Гриль меню",
        icon: "/icons/icon-category.svg",
        bgImage: "/images/cat-grill.png",
        subcategories: [
            { title: "Шашлик", href: "#", icon: "/icons/icon-category.svg" },
            { title: "Люля-кебаб", href: "#", icon: "/icons/icon-category.svg" },
            { title: "Риба на грилі", href: "#", icon: "/icons/icon-category.svg" },
        ]
    },
    {
        id: "brand-steaks",
        title: "Стейки від бренд-шефа",
        icon: "/icons/icon-cow.svg",
        bgImage: "/images/catalog-bg.png",
        subcategories: [
            { title: "Стейки сухої витримки", href: "#", icon: "/icons/icon-category.svg" },
            { title: "Стейки вологої витримки", href: "#", icon: "/icons/icon-category.svg" },
            { title: "Альтернативні стейки (гриль)", href: "#", icon: "/icons/icon-category.svg" },
            { title: "М'ясо на грилі", href: "#", icon: "/icons/icon-category.svg" },
            { title: "Овочі гриль", href: "#", icon: "/icons/icon-category.svg" },
        ]
    },
    {
        id: "restaurant",
        title: "Ресторанне меню",
        icon: "/icons/icon-category.svg",
        bgImage: "/images/cat-restaurant.png",
        subcategories: [
            { title: "Перші страви", href: "#", icon: "/icons/icon-category.svg" },
            { title: "Салати", href: "#", icon: "/icons/icon-category.svg" },
            { title: "Гарніри", href: "#", icon: "/icons/icon-category.svg" },
        ]
    },
    {
        id: "burgers",
        title: "Бургери",
        icon: "/icons/icon-category.svg",
        bgImage: "/images/cat-burgers.png",
        subcategories: [
            { title: "Чізбургер", href: "#", icon: "/icons/icon-category.svg" },
            { title: "Фірмовий бургер", href: "#", icon: "/icons/icon-category.svg" },
            { title: "Гострий бургер", href: "#", icon: "/icons/icon-category.svg" },
        ]
    },
    {
        id: "kids",
        title: "Дитяче меню",
        icon: "/icons/icon-category.svg",
        bgImage: "/images/catalog-bg.png",
        subcategories: [
            { title: "Нагетси", href: "#", icon: "/icons/icon-category.svg" },
            { title: "Макарони", href: "#", icon: "/icons/icon-category.svg" },
            { title: "Дитяче пюре", href: "#", icon: "/icons/icon-category.svg" },
        ]
    },
    {
        id: "production",
        title: "Власне виробництво",
        icon: "/icons/icon-category.svg",
        bgImage: "/images/catalog-bg.png",
        subcategories: [
            { title: "Пельмені", href: "#", icon: "/icons/icon-category.svg" },
            { title: "Вареники", href: "#", icon: "/icons/icon-category.svg" },
            { title: "Котлети", href: "#", icon: "/icons/icon-category.svg" },
        ]
    },
    {
        id: "meat",
        title: "М'ясна продукція",
        icon: "/icons/icon-cow.svg",
        bgImage: "/images/catalog-bg.png",
        subcategories: [
            { title: "Яловичина", href: "#", icon: "/icons/icon-category.svg" },
            { title: "Свинина", href: "#", icon: "/icons/icon-category.svg" },
            { title: "Курятина", href: "#", icon: "/icons/icon-category.svg" },
        ]
    },
    {
        id: "preservation",
        title: "Консервація",
        icon: "/icons/icon-category.svg",
        bgImage: "/images/catalog-bg.png",
        subcategories: [
            { title: "Огірки", href: "#", icon: "/icons/icon-category.svg" },
            { title: "Помідори", href: "#", icon: "/icons/icon-category.svg" },
            { title: "Соуси у банках", href: "#", icon: "/icons/icon-category.svg" },
        ]
    },
    {
        id: "cheese",
        title: "Сири",
        icon: "/icons/icon-lamb.svg",
        bgImage: "/images/catalog-bg.png",
        subcategories: [
            { title: "М'які сири", href: "#", icon: "/icons/icon-category.svg" },
            { title: "Тверді сири", href: "#", icon: "/icons/icon-category.svg" },
        ]
    },
    {
        id: "oil",
        title: "Масло",
        icon: "/icons/icon-category.svg",
        bgImage: "/images/catalog-bg.png",
        subcategories: [
            { title: "Вершкове масло", href: "#", icon: "/icons/icon-category.svg" },
            { title: "Масло з травами", href: "#", icon: "/icons/icon-category.svg" },
        ]
    },
    {
        id: "sauces",
        title: "Соуси",
        icon: "/icons/icon-skewer.svg",
        bgImage: "/images/catalog-bg.png",
        subcategories: [
            { title: "Гострі соуси", href: "#", icon: "/icons/icon-category.svg" },
            { title: "Томатні соуси", href: "#", icon: "/icons/icon-category.svg" },
        ]
    },
];

interface CatalogMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CatalogMenu({ isOpen, onClose }: CatalogMenuProps) {
    const [activeCategory, setActiveCategory] = useState<Category>(CATALOG_DATA[4]); // Default to steaks for demo matching Figma
    const { disableScroll, enableScroll } = useScrollLock();

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
        } else {
            enableScroll();
        }
        return () => {
            enableScroll();
        };
    }, [isOpen, disableScroll, enableScroll]);

    if (!isOpen) return null;

    return (
        <div className={s.overlay} onClick={onClose}>
            <div className={s.menuWrapper} onClick={(e) => e.stopPropagation()}>
                <div className={s.sidebar}>
                    <ul className={s.categoryList}>
                        {CATALOG_DATA.map((cat) => (
                            <li
                                key={cat.id}
                                className={clsx(s.categoryItem, activeCategory.id === cat.id && s.active)}
                                onMouseEnter={() => setActiveCategory(cat)}
                            >
                                <div className={s.categoryLink}>
                                    <div className={s.iconWrapper}>
                                        {cat.icon && <Image src={cat.icon} alt="" width={16} height={16} className={s.icon} />}
                                    </div>
                                    <span className={s.catTitle}>{cat.title}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className={s.content}>
                    <div className={s.bgImageWrapper} key={activeCategory.id}>
                        <Image
                            src={activeCategory.bgImage || "/images/catalog-bg.png"}
                            alt="Background"
                            fill
                            className={s.bgImage}
                            priority
                        />
                    </div>

                    <div className={s.subContent}>
                        {activeCategory.subcategories && (
                            <ul className={s.subList}>
                                {activeCategory.subcategories.map((sub, i) => (
                                    <li key={i} className={s.subItem}>
                                        <Link href={sub.href} className={s.subLink}>
                                            <span className={s.subTitleText}>{sub.title}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
