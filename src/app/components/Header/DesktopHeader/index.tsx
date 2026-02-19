import TopBar from "@/app/components/Header/DesktopHeader/TopBar";
import MainBar from "@/app/components/Header/DesktopHeader/MainBar";
import s from "./DesktopHeader.module.scss";
import { type Locale } from "@/i18n/config";

interface DesktopHeaderProps {
    lang: Locale;
}

export default function DesktopHeader({ lang }: DesktopHeaderProps) {
    return (
        <>
            <TopBar lang={lang} />
            <div className={s.stickyWrapper}>
                <MainBar lang={lang} />
            </div>
        </>
    );
}