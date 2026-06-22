import React from "react";
import clsx from "clsx";
import s from "./SectionHeader.module.scss";

interface SectionHeaderProps {
    title: React.ReactNode;
    withDots?: boolean;
    classNameWrapper?: string;
    classNameTitle?: string;
    classNameDots?: string;
    isDark?: boolean;
}

export default function SectionHeader({ title, withDots = true, classNameWrapper, classNameTitle, classNameDots, isDark = false }: SectionHeaderProps) {
    return (
        <div className={clsx(s.wrapper, classNameWrapper, isDark && s.dark)}>
            <h2 className={clsx(s.title, classNameTitle)}>{title}</h2>
            {withDots && (
                <div className={clsx(s.dots, classNameDots)}>
                    <span className={s.dot}></span>
                    <span className={s.dot}></span>
                    <span className={s.dot}></span>
                </div>
            )}
        </div>
    );
}
