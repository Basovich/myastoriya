import React from "react";
import s from "./StoreViewToggle.module.scss";
import clsx from "clsx";
import { type ViewMode } from "../../../pages/OurStores/index";

interface StoreViewToggleProps {
    viewMode: ViewMode;
    onViewChange: (mode: ViewMode) => void;
    dict: {
        list: string;
        map: string;
    };
}

export default function StoreViewToggle({ viewMode, onViewChange, dict }: StoreViewToggleProps) {
    return (
        <div className={s.toggleWrapper}>
            <button
                className={clsx(s.toggleBtn, viewMode === "list" && s.active)}
                onClick={() => onViewChange("list")}
            >
                <span>{dict.list}</span>
                <div className={s.icon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="8" y1="6" x2="21" y2="6" />
                        <line x1="8" y1="12" x2="21" y2="12" />
                        <line x1="8" y1="18" x2="21" y2="18" />
                        <path d="M3 6h1v0H3V6zm0 6h1v0H3v0zm0 6h1v0H3v0z" strokeLinecap="round" />
                    </svg>
                </div>
            </button>
            <button
                className={clsx(s.toggleBtn, viewMode === "map" && s.active)}
                onClick={() => onViewChange("map")}
            >
                <span>{dict.map}</span>
                <div className={s.icon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                </div>
            </button>
        </div>
    );
}
