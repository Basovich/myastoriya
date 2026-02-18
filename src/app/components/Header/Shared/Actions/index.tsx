import s from "./Actions.module.scss";
import siteData from "@/content/site.json";

interface ActionsProps {
    showLogin?: boolean;
}

export default function Actions({ showLogin = false }: ActionsProps) {
    return (
        <div className={s.actions}>
            {/* Cart */}
            <button className={s.actionBtn} aria-label="Кошик">
                <img src="/icons/icon-cart.svg" alt="Cart" width="20" height="20" />
                <span className={s.badge}>3</span>
            </button>

            {/* Heart (Favorites) */}
            <button className={s.actionBtn} aria-label="Обране">
                <img src="/icons/icon-heart.svg" alt="Favorites" width="20" height="20" />
                <span className={s.badge}>3</span>
            </button>

            {/* Profile */}
            <button className={s.actionBtn} aria-label="Профіль">
                <img src="/icons/icon-profile.svg" alt="Profile" width="16" height="18" />
            </button>

            {/* DESKTOP: Login link */}
            {showLogin && (
                <a href="#" className={s.loginLink}>Вхід</a>
            )}
        </div>
    );
}
