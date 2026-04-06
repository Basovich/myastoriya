import React from "react";
import s from "./Search.module.scss";
import clsx from "clsx";

interface SearchProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    buttonText?: string;
    buttonColor?: "red" | "black";
    className?: string;
    showButton?: boolean;
}

const Search = React.forwardRef<HTMLInputElement, SearchProps>(({ 
    value, 
    onChange, 
    placeholder = "Пошук...", 
    buttonText = "ПОШУК", 
    buttonColor = "red",
    className,
    showButton = true
}, ref) => {
    return (
        <div className={clsx(s.searchWrapper, className, !showButton && s.noButton)}>
            <div className={s.inputContainer}>
                <div className={s.icon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </div>
                <input
                    ref={ref}
                    type="text"
                    className={s.input}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
            {showButton && (
                <button className={clsx(s.searchBtn, s[buttonColor])}>
                    {buttonText}
                </button>
            )}
        </div>
    );
});

export default Search;
