"use client";

import { useState } from "react";
import s from "./MainBar.module.scss";
import Logo from "@/app/components/Header/Shared/Logo";
import Actions from "@/app/components/Header/Shared/Actions";
import Search from "@/app/components/Header/DesktopHeader/MainBar/Search";
import CitySelector from "@/app/components/Header/DesktopHeader/MainBar/CitySelector";
import CatalogMenu from "@/app/components/Header/DesktopHeader/MainBar/CatalogMenu";
import { type Locale } from "@/i18n/config";
import Image from "next/image";

interface MainBarProps {
    lang: Locale;
}

export default function MainBar({ lang }: MainBarProps) {
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);

    return (
        <div className={s.mainBar}>
            <div className={s.mainBarInner}>
                <div className={s.logoWrapper}>
                    <Logo lang={lang} />
                </div>

                <div className={s.centerBlock}>
                    <button
                        onClick={() => setIsCatalogOpen(!isCatalogOpen)}
                        className={`${s.catalogBtn} ${isCatalogOpen ? s.active : ""}`}
                    >
                        {isCatalogOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="15" viewBox="0 0 26 15" fill="none">
                                <path d="M18.9851 13.6568L12.6566 7.32837L18.9851 0.999945" stroke="white" stroke-width="2" stroke-linecap="round"/>
                                <path d="M6.32843 1.00019L12.6568 7.32861L6.32843 13.657" stroke="white" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        ) : (
                            <Image src="/icons/icon-category.svg" alt="Categories" width="18" height="18" />
                        )}
                        Каталог продукції
                    </button>

                    <div className={s.searchWrapper}>
                        <Search />
                    </div>

                    <CitySelector />
                </div>

                <div className={s.rightSection}>
                    <div className={s.actionsWrapper}>
                        <Actions />
                    </div>
                </div>
            </div>

            <CatalogMenu isOpen={isCatalogOpen} onClose={() => setIsCatalogOpen(false)} />
        </div>
    );
}
