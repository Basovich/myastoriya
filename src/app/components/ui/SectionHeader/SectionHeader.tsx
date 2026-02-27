import clsx from "clsx";
import s from "./SectionHeader.module.scss";

interface SectionHeaderProps {
    title: string;
    withDots?: boolean;
    align?: 'center' | 'left';
    className?: string;
}

export default function SectionHeader({ title, withDots = true, align = 'center', className }: SectionHeaderProps) {
    return (
        <div className={clsx(s.sectionHeader, s[align], className)}>
            <h2 className={s.title}>{title}</h2>
            {withDots && (
                <div className={s.dots}>
                    <span className={s.dot}></span>
                    <span className={s.dot}></span>
                    <span className={s.dot}></span>
                </div>
            )}
        </div>
    );
}
