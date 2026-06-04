'use client';

import s from "./ToggleMenu.module.scss";
import Image from "next/image";
import { type Locale } from "@/i18n/config";

interface ToggleMenuProps {
    onClick: () => void;
    lang?: Locale;
}

export default function ToggleMenu({ onClick, lang = 'ua' }: ToggleMenuProps) {
    return (
        <button className={s.menuBtn} onClick={onClick} aria-label={lang === 'ru' ? 'Меню' : 'Меню'}>
            <Image
                src="/icons/burger-grid.svg"
                alt="Menu"
                width={24}
                height={24}
            />
        </button>
    );
}