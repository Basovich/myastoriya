import s from "./MainBar.module.scss";
import Logo from "@/app/components/Header/Shared/Logo";
import Actions from "@/app/components/Header/Shared/Actions";
import CitySelector from "@/app/components/Header/DesktopHeader/CitySelector";
import { type Locale } from "@/i18n/config";

interface MainBarProps {
    lang: Locale;
}

export default function MainBar({ lang }: MainBarProps) {
    return (
        <div className={s.mainBar}>
            <div className={s.mainBarInner}>
                <div className={s.logoWrapper}>
                    <Logo lang={lang} />
                </div>

                <a href="#categories" className={s.catalogBtn}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                    Каталог продукції
                </a>

                <CitySelector />

                <Actions showLogin={true} />
            </div>
        </div>
    );
}
