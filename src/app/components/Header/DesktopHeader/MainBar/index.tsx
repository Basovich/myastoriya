import s from "./MainBar.module.scss";
import Logo from "@/app/components/Header/Shared/Logo";
import Actions from "@/app/components/Header/Shared/Actions";
import Search from "@/app/components/Header/DesktopHeader/MainBar/Search";
import CitySelector from "@/app/components/Header/DesktopHeader/MainBar/CitySelector";
import { type Locale } from "@/i18n/config";
import Image from "next/image";

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

                <div className={s.centerBlock}>
                    <a href="#catalog" className={s.catalogBtn}>
                        <Image src="/icons/icon-category.svg" alt="Categories" width="18" height="18" />
                        Каталог продукції
                    </a>

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
        </div>
    );
}
