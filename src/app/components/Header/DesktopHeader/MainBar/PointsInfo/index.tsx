import s from "./PointsInfo.module.scss";

interface PointsInfoProps {
    points: number;
    lang?: string;
}

export default function PointsInfo({ points, lang = 'ua' }: PointsInfoProps) {
    if (!points || points <= 0) return null;

    return (
        <div className={s.pointsInfo}>
            <span className={s.label}>{lang === 'ru' ? 'Ваши баллы' : 'Ваші бали'}</span>
            <div className={s.valueWrapper}>
                <span className={s.value}>{points}</span>
            </div>
        </div>
    );
}
