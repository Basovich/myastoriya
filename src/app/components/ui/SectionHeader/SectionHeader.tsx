import s from "./SectionHeader.module.scss";

interface SectionHeaderProps {
    title: string;
    showArrows?: boolean;
    onPrev?: () => void;
    onNext?: () => void;
}

export default function SectionHeader({
    title,
    showArrows = false,
    onPrev,
    onNext,
}: SectionHeaderProps) {
    return (
        <div className={s.header}>
            <div className={s.titleGroup}>
                <h2 className={s.title}>{title}</h2>
                <div className={s.dots}>
                    <span /><span /><span />
                </div>
            </div>
            {showArrows && (
                <div className={s.arrows}>
                    <button className={s.arrow} onClick={onPrev} aria-label="Назад">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <button className={s.arrow} onClick={onNext} aria-label="Вперед">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                    </button>
                </div>
            )}
        </div>
    );
}
