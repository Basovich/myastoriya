import s from "./SectionHeader.module.scss";

interface SectionHeaderProps {
    title: string;
    withDots?: boolean;
    align?: 'center' | 'left';
}

export default function SectionHeader({ title, withDots = true, align = 'center' }: SectionHeaderProps) {
    return (
        <div className={`${s.sectionHeader} ${s[align]}`}>
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
