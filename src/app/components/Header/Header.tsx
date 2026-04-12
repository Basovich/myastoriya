"use client";

import s from "./Header.module.scss";
import { type Locale } from "@/i18n/config";
import MobileHeader from "./MobileHeader";
import DesktopHeader from "./DesktopHeader";
import CitySelector from "./DesktopHeader/MainBar/CitySelector";

interface HeaderProps {
    lang: Locale;
}

export default function Header({ lang }: HeaderProps) {
    return (
        <header className={s.header} id="header">
            {/* Dedicated handler for global city selector UI (Popups/Overlay) */}
            <CitySelector lang={lang} renderSelector={false} renderGlobalUI={true} />
            
            <div className={s.mobileOnly}>
                <MobileHeader lang={lang} />
            </div>
            <div className={s.desktopOnly}>
                <DesktopHeader lang={lang} />
            </div>
        </header>
    );
}
