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
    as?: 'h2' | 'h3' | 'p' | 'div';
}

export default function SectionHeader({
    title,
    withDots = true,
    classNameWrapper,
    classNameTitle,
    classNameDots,
    isDark = false,
    as = 'h2',
}: SectionHeaderProps) {
    const Tag = as;
    return (
        <div className={clsx(s.wrapper, classNameWrapper, isDark && s.dark)}>
            <Tag className={clsx(s.title, classNameTitle)}>{title}</Tag>
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
