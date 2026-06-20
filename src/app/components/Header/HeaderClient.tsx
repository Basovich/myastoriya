"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import s from "./HeaderClient.module.scss";
import { type Locale } from "@/i18n/config";
import MobileHeader from "./MobileHeader/MobileHeaderClient";
import DesktopHeader from "./DesktopHeader/DesktopHeaderClient";
import CitySelector from "./DesktopHeader/MainBar/CitySelector";
import { ProductCategory } from "@/lib/graphql/queries/products";

interface HeaderProps {
    lang: Locale;
    initialCategories?: ProductCategory[];
}

export default function HeaderClient({ lang, initialCategories }: HeaderProps) {
    const pathname = usePathname();
    const isMenuPage = /^\/(?:[a-z]{2}\/)?our-stores\/[^\/]+\/menu$/.test(pathname || "");

    const getRootCategories = (list: ProductCategory[]) => {
        const mainCat = list.find(c => String(c.id) === "768" || c.name.toLowerCase().includes("для сайта"));
        return mainCat?.children || list;
    };

    const [categories, setCategories] = useState<ProductCategory[]>(() => getRootCategories(initialCategories || []));

    // Return null to hide header on restaurant menu pages
    if (isMenuPage) {
        return null;
    }

    useEffect(() => {
        if (initialCategories && initialCategories.length > 0) return;

        fetch("/api/catalog/tree", {
            headers: {
                'content-language': lang === 'ru' ? 'ru_RU' : 'uk_UA'
            }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setCategories(getRootCategories(data));
                }
            })
            .catch(err => console.error("Header: Failed to fetch categories:", err));
    }, [lang, initialCategories]);

    return (
        <header className={s.header} id="header">
            {/* Dedicated handler for global city selector UI (Popups/Overlay) */}
            <CitySelector lang={lang} renderSelector={false} renderGlobalUI={true} />
            
            <div className={s.mobileOnly}>
                <MobileHeader lang={lang} categories={categories} />
            </div>
            <div className={s.desktopOnly}>
                <DesktopHeader lang={lang} categories={categories} />
            </div>
        </header>
    );
}
