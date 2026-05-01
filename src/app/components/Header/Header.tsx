"use client";

import { useState, useEffect } from "react";
import s from "./Header.module.scss";
import { type Locale } from "@/i18n/config";
import MobileHeader from "./MobileHeader";
import DesktopHeader from "./DesktopHeader";
import CitySelector from "./DesktopHeader/MainBar/CitySelector";
import { ProductCategory } from "@/lib/graphql/queries/products";

interface HeaderProps {
    lang: Locale;
    initialCategories?: ProductCategory[];
}

export default function Header({ lang, initialCategories }: HeaderProps) {
    const getRootCategories = (list: ProductCategory[]) => {
        const mainCat = list.find(c => String(c.id) === "768" || c.name.toLowerCase().includes("для сайта"));
        return mainCat?.children || list;
    };

    const [categories, setCategories] = useState<ProductCategory[]>(() => getRootCategories(initialCategories || []));

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
