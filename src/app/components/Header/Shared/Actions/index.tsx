import s from "./Actions.module.scss";
import Image from "next/image";

interface ActionsProps {
    showLogin?: boolean;
}

export default function Actions({ showLogin = false }: ActionsProps) {
    return (
        <div className={s.actions}>
            {/* Cart */}
            <button className={s.actionBtn} aria-label="Кошик">
                <Image src="/icons/shopping-bag.png" alt="Cart" width="20" height="20" />
                <span className={s.badge}>3</span>
            </button>

            {/* Heart (Favorites) */}
            <button className={s.actionBtn} aria-label="Обране">
                <Image src="/icons/icon-heart.svg" alt="Favorites" width="20" height="20" />
                <span className={s.badge}>3</span>
            </button>

            {/* DESKTOP: Login link */}
            {showLogin && (
                <a href="#" className={s.loginLink}>
                    Вхід
                    <Image src="/icons/icon-profile.svg" alt="Profile" width="20" height="20" className={s.loginIcon} />
                </a>
            )}
        </div>
    );
}
