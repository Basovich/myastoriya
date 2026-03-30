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
                <span>{dict.list.toUpperCase()}</span>
                <div className={s.icon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 6H21V8H8V6ZM8 11H21V13H8V11ZM8 16H21V18H8V16ZM3 6H6V8H3V6ZM3 11H6V13H3V11ZM3 16H6V18H3V16Z" fill="currentColor"/>
                    </svg>
                </div>
            </button>
            <button
                className={clsx(s.toggleBtn, viewMode === "map" && s.active)}
                onClick={() => onViewChange("map")}
            >
                <span>{dict.map.toUpperCase()}</span>
                <div className={s.icon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                    </svg>
                </div>
            </button>
        </div>
    );
}

