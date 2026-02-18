import s from "./SectionHeader.module.scss";

interface SectionHeaderProps {
    title: string;
}

export default function SectionHeader({ title }: SectionHeaderProps) {
    return (
        <div className={s.sectionHeader}>
            <h2 className={s.title}>{title}</h2>
        </div>
    );
}
