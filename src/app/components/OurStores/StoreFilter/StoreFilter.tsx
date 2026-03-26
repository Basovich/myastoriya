import React from "react";
import s from "./StoreFilter.module.scss";
import clsx from "clsx";
import { type StoreType, type ViewMode } from "../../../pages/OurStores/index";

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
    const filters: { id: StoreType, label: string, icon?: string }[] = [
        { id: "restaurant", label: dict.restaurants, icon: "shop" },
        { id: "meatbar", label: dict.meatbar, icon: "meat" }
    ];

    return (
        <div className={s.filterWrapper}>
            {filters.map((filter) => (
                <button
                    key={filter.id}
                    className={clsx(s.filterBtn, activeFilter === filter.id && s.active)}
                    onClick={() => onFilterChange(filter.id)}
                >
                    {filter.icon && (
                        <div className={s.icon}>
                            <img src={`/icons/stores/${filter.icon}${activeFilter === filter.id ? '-white' : ''}.svg`} alt="" />
                        </div>
                    )}
                    <span>{filter.label}</span>
                </button>
            ))}
        </div>
    );
}
