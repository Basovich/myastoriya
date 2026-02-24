"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import s from "./CatalogMenu.module.scss";
import { useScrollLock } from "@/hooks/useScrollLock";

interface Category {
    id: string;
    title: string;
    icon?: string;
    subcategories?: { title: string; href: string }[];
}

const CATALOG_DATA: Category[] = [
    { id: "summer", title: "Літнє меню" },
    { id: "takeaway", title: "Візьми з собою" },
    { id: "sets", title: "Набори для компаній" },
    { id: "grill", title: "Гриль меню" },
    {
        id: "brand-steaks",
        title: "Стейки від бренд-шефа",
        icon: "/icons/icon-cow.svg",
        subcategories: [
            { title: "Стейки сухої витримки", href: "#" },
            { title: "Стейки вологої витримки", href: "#" },
            { title: "Альтернативні стейки (гриль)", href: "#" },
            { title: "М'ясо на грилі", href: "#" },
            { title: "Овочі гриль", href: "#" },
        ]
    },
    { id: "restaurant", title: "Ресторанне меню" },
    { id: "burgers", title: "Бургери" },
    { id: "kids", title: "Дитяче меню" },
    { id: "production", title: "Власне виробництво" },
    { id: "meat", title: "М'ясна продукція", icon: "/icons/icon-cow.svg" },
    { id: "preservation", title: "Консервація" },
    { id: "cheese", title: "Сири", icon: "/icons/icon-lamb.svg" },
    { id: "oil", title: "Масло" },
    { id: "sauces", title: "Соуси", icon: "/icons/icon-skewer.svg" },
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
                                className={`${s.categoryItem} ${activeCategory.id === cat.id ? s.active : ""}`}
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
                    <div className={s.bgImageWrapper}>
                        <Image
                            src="/images/catalog-bg.png"
                            alt="Background"
                            fill
                            className={s.bgImage}
                            priority
                        />
                    </div>

                    <div className={s.subContent}>
                        <h2 className={s.currentTitle}>{activeCategory.title}</h2>
                        {activeCategory.subcategories && (
                            <ul className={s.subList}>
                                {activeCategory.subcategories.map((sub, i) => (
                                    <li key={i} className={s.subItem}>
                                        <Link href={sub.href} className={s.subLink}>
                                            {sub.title}
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
