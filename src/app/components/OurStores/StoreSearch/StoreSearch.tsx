import React from "react";
import s from "./StoreSearch.module.scss";

interface StoreSearchProps {
    value: string;
    onChange: (value: string) => void;
    dict: {
        placeholder: string;
        button: string;
    };
}

export default function StoreSearch({ value, onChange, dict }: StoreSearchProps) {
    return (
        <div className={s.searchWrapper}>
            <div className={s.inputContainer}>
                <div className={s.icon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </div>
                <input
                    type="text"
                    className={s.input}
                    placeholder={dict.placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
            <button className={s.searchBtn}>
                {dict.button}
            </button>
        </div>
    );
}
