import s from "./CitySelector.module.scss";

export default function CitySelector() {
    return (
        <div className={s.citySelector}>
            <span className={s.cityLabel}>ВАШЕ МІСТО</span>
            <span className={s.cityValue}>
                Київ
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </span>
        </div>
    );
}
