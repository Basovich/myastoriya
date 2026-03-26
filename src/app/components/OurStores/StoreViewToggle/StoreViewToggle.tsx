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
                        <line x1="3" y1="6" x2="3.01" y2="6" />
                        <line x1="3" y1="12" x2="3.01" y2="12" />
                        <line x1="3" y1="18" x2="3.01" y2="18" />
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
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                    </svg>
                </div>
            </button>
        </div>
    );
}
