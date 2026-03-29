import React from "react";
import s from "./StoreFilter.module.scss";
import clsx from "clsx";
import { type StoreType } from "../../../pages/OurStores/index";

interface StoreFilterProps {
    activeFilter: StoreType;
    onFilterChange: (filter: StoreType) => void;
    dict: {
        all: string;
        restaurants: string;
        meatbar: string;
    };
}

export default function StoreFilter({ activeFilter, onFilterChange, dict }: StoreFilterProps) {
    const filters: { id: StoreType, label: string, icon: React.ReactNode }[] = [
        { 
            id: "restaurant", 
            label: dict.restaurants, 
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
            )
        },
        { 
            id: "meatbar", 
            label: dict.meatbar, 
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M2 12h20" />
                    <path d="M18.5 5.5l-13 13M18.5 18.5l-13-13" />
                </svg>
            )
        }
    ];

    return (
        <div className={s.filterWrapper}>
            {filters.map((filter) => (
                <button
                    key={filter.id}
                    className={clsx(s.filterBtn, activeFilter === filter.id && s.active)}
                    onClick={() => onFilterChange(filter.id)}
                >
                    <div className={s.icon}>{filter.icon}</div>
                    <span>{filter.label}</span>
                </button>
            ))}
        </div>
    );
}
