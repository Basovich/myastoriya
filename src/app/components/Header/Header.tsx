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
            <div className={s.mobileOnly}>
                {/* Global city logic and responsive fixed prompt for mobile/tablet */}
                <CitySelector renderSelector={false} />
                <MobileHeader lang={lang} />
            </div>
            <div className={s.desktopOnly}>
                <DesktopHeader lang={lang} />
            </div>
        </header>
    );
}
