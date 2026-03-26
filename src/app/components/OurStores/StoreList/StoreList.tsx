import React from "react";
import s from "./StoreList.module.scss";
import StoreCard, { type Store } from "../StoreCard/StoreCard";

interface StoreListProps {
    stores: Store[];
    dict: {
        workingHours: string;
        details: string;
        route: string;
    };
}

export default function StoreList({ stores, dict }: StoreListProps) {
    if (stores.length === 0) {
        return (
            <div className={s.empty}>
                Закладів не знайдено за вашим запитом.
            </div>
        );
    }

    return (
        <div className={s.grid}>
            {stores.map((store) => (
                <StoreCard key={store.id} store={store} dict={dict} />
            ))}
        </div>
    );
}
