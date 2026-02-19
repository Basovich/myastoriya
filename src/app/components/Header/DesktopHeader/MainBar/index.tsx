import s from "./MainBar.module.scss";
import Logo from "@/app/components/Header/Shared/Logo";
import Actions from "@/app/components/Header/Shared/Actions";
import Search from "@/app/components/Header/DesktopHeader/MainBar/Search";
import CitySelector from "@/app/components/Header/DesktopHeader/MainBar/CitySelector";
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

                <a href="#catalog" className={s.catalogBtn}>
                    <div className={s.burgerIcon}>
                        <span></span><span></span><span></span><span></span>
                    </div>
                    Каталог продукції
                </a>

                <div className={s.searchWrapper}>
                    <Search />
                </div>

                <div className={s.rightSection}>
                    <CitySelector />

                    <div className={s.actionsWrapper}>
                        <Actions showLogin={true} />
                    </div>
                </div>
            </div>
        </div>
    );
}
