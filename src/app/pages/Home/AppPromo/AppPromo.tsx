import s from "./AppPromo.module.scss";
import Image from "next/image";
import homeData from "@/content/pages/home.json";

export default function AppPromo() {
    const { appPromo } = homeData;

    return (
        <section className={s.section} id="apppromo">
            <div className={s.banner}>
                <picture className={s.imageWrap}>
                    <source media="(min-width: 768px)"
                            srcSet="/images/app_promo/appPromoBGDesktop.png"
                    />
                    <Image
                        src="/images/app_promo/appPromoBGMobile.png"
                        alt="App Promo Background"
                        className={s.bgImage}
                        fill
                        loading="lazy"
                    />
                </picture>
                <div className={s.contentOverlay}>
                    <div className={s.titleRow}>
                        <Image
                            src="/icons/app_promo_arrows.svg"
                            alt=""
                            className={s.redArrows}
                            loading="lazy"
                            width={20}
                            height={20}
                        />
                        <div className={s.titles}>
                            <p className={s.subtitle}>ПРИЛОЖЕНИЕ</p>
                            <p className={s.mainTitle}>“МЯСТОРИЯ”</p>
                        </div>
                    </div>
                    <div className={s.buttons}>
                        <a href="https://play.google.com/store/apps/details?id=ua.myastoriya.shop" className={s.storeBtn}>
                            <Image src="/icons/google_play.svg" className={s.google} alt="Google Play" width={74} height={14} />
                        </a>
                        <a href="https://apps.apple.com/ua/app/myastoriya/id1583915008" className={s.storeBtn}>
                            <Image src="/icons/apple_store.svg" className={s.apple} alt="Apple Store" width={71} height={16} />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
