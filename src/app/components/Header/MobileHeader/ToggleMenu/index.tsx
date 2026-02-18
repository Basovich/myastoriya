'use client';

import { useState } from "react";
import s from "./ToggleMenu.module.scss";
import Image from "next/image";

export default function ToggleMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <button className={s.menuBtn} onClick={toggleMenu} aria-label="Меню">
            <Image
                src="/icons/burger-grid.svg"
                alt="Menu"
                width={24}
                height={24}
            />
        </button>
    );
}