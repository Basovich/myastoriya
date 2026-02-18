import ToggleMenu from "@/app/components/Header/MobileHeader/ToggleMenu";
import Logo from "@/app/components/Header/Shared/Logo";
import Actions from "@/app/components/Header/Shared/Actions";
import s from "./TopBar.module.scss";
import { type Locale } from "@/i18n/config";

interface TopBarProps {
    lang: Locale;
    onMenuClick: () => void;
}

export default function TopBar({ lang, onMenuClick }: TopBarProps) {
    return (
        <div className={s.topBar}>
            <ToggleMenu onClick={onMenuClick} />
            <Logo lang={lang} className={s.logo} />
            {/* Mobile Actions don't show login link usually, or do they? Header.tsx had loginLink hidden on mobile */}
            <Actions showLogin={false} />
        </div>
    );
}