import s from "./Search.module.scss";

export default function Search() {
    return (
        <div className={s.search}>
            <div className={s.iconWrapper}>
                <img src="/icons/icon-search.svg" alt="Search" width="20" height="20" />
            </div>
            <input
                type="text"
                placeholder="Я шукаю..."
                className={s.input}
            />
            <button className={s.searchBtn}>
                пошук
            </button>
        </div>
    );
}
