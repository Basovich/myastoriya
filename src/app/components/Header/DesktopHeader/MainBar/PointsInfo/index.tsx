import s from "./PointsInfo.module.scss";

export default function PointsInfo() {
    return (
        <div className={s.pointsInfo}>
            <span className={s.label}>Ваші бали</span>
            <div className={s.valueWrapper}>
                <span className={s.value}>323</span>
            </div>
        </div>
    );
}
