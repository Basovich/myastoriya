import s from "./SearchBar.module.scss";

export default function SearchBar() {
    return (
        <div className={s.searchBar}>
            <div className={s.searchInputWrapper}>
                <svg className={s.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    type="text"
                    className={s.searchInput}
                    placeholder="Я шукаю..."
                    readOnly
                />
                <button className={s.searchBtn}>ПОШУК</button>
            </div>
        </div>
    );
}
