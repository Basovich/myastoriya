'use client';

import { useState } from "react";
import s from "./ToggleMenu.module.scss";
import Image from "next/image";

interface ToggleMenuProps {
    onClick: () => void;
}

export default function ToggleMenu({ onClick }: ToggleMenuProps) {
    return (
        <button className={s.menuBtn} onClick={onClick} aria-label="Меню">
            <Image
                src="/icons/burger-grid.svg"
                alt="Menu"
                width={24}
                height={24}
            />
        </button>
    );
}