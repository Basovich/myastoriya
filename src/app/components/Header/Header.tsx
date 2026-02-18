"use client";

import s from "./Header.module.scss";
import { type Locale } from "@/i18n/config";
import MobileHeader from "./MobileHeader";
import DesktopHeader from "./DesktopHeader";

interface HeaderProps {
    lang: Locale;
}

export default function Header({ lang }: HeaderProps) {
    return (
        <header className={s.header} id="header">
            <div className={s.mobileOnly}>
                <MobileHeader lang={lang} />
            </div>
            <div className={s.desktopOnly}>
                <DesktopHeader lang={lang} />
            </div>
        </header>
    );
}
