import clsx from "clsx";
import s from "./SectionHeader.module.scss";

interface SectionHeaderProps {
    title: string;
    withDots?: boolean;
    classNameWrapper?: string;
    classNameTitle?: string;
    classNameDots?: string;
}

export default function SectionHeader({ title, withDots = true, classNameWrapper, classNameTitle, classNameDots }: SectionHeaderProps) {
    return (
        <div className={clsx(s.wrapper, classNameWrapper)}>
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
