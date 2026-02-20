import s from "./AppPromo.module.scss";
import Image from "next/image";
import homeData from "@/content/pages/home.json";

export default function AppPromo() {
    const { appPromo } = homeData;

    return (
        <section className={s.section} id="apppromo">
            <div className={s.banner}>
                {/* Background Image Container */}
                <div className={s.imageWrap}>
                    <Image
                        src="/images/app-promo-bg.png"
                        alt="App Promo Background"
                        fill
                        className={s.bgImage}
                        priority
                    />
                </div>

                {/* Content Overlay */}
                <div className={s.contentOverlay}>
                    <div className={s.textRightBox}>
                        <div className={s.titleRow}>
                            <span className={s.redArrows}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 17L17 12L12 7" stroke="#E30613" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M5 17L10 12L5 7" stroke="#E30613" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                            <div className={s.titles}>
                                <h2 className={s.subtitle}>ПРИЛОЖЕНИЕ</h2>
                                <h1 className={s.mainTitle}>“МЯСТОРИЯ”</h1>
                            </div>
                        </div>

                        <div className={s.buttons}>
                            <a href={appPromo.googlePlay} className={s.storeBtn}>
                                <Image src="/icons/google_play.svg" alt="Google Play" width={130} height={40} />
                            </a>
                            <a href={appPromo.appStore} className={s.storeBtn}>
                                <Image src="/icons/apple_store.svg" alt="Apple Store" width={124} height={40} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
