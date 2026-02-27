import clsx from "clsx";
import s from "./SectionHeader.module.scss";

interface SectionHeaderProps {
    title: string;
    withDots?: boolean;
    classNameTitle?: string;
    classNameDots?: string;
}

export default function SectionHeader({ title, withDots = true, classNameTitle, classNameDots }: SectionHeaderProps) {
    return (
        <>
            <h2 className={clsx(s.title, classNameTitle)}>{title}</h2>
            {withDots && (
                <div className={clsx(s.dots, classNameDots)}>
                    <span className={s.dot}></span>
                    <span className={s.dot}></span>
                    <span className={s.dot}></span>
                </div>
            )}
        </>
    );
}
