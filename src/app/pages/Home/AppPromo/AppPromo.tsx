import s from "./AppPromo.module.scss";
import Image from "next/image";
import { Locale } from "@/i18n/config";

const CONTENT: Record<string, { title1: string; title2: string; tagline: string }> = {
    ua: {
        title1: "ЗАСТОСУНОК",
        title2: "«М'ЯСТОРІЯ»",
        tagline: "смачненьке у вашому смартфоні",
    },
    ru: {
        title1: "ПРИЛОЖЕНИЕ",
        title2: "«МЯСТОРИЯ»",
        tagline: "вкусненькое в вашем смартфоне",
    },
};

interface Props {
    lang: Locale;
}

export default function AppPromo({ lang }: Props) {
    const content = CONTENT[lang] || CONTENT.ua;

    return (
        <section className={s.section} id="apppromo">
            <div className={s.banner}>
                <div className={s.imageWrap}>
                    <Image
                        src="/images/app_promo/appPromoBGDesktop.webp"
                        alt="App Promo Background"
                        className={s.bgImage}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 1200px, 1300px"
                        loading="lazy"
                    />
                </div>
                <div className={s.contentOverlay}>
                    <div className={s.textBlock}>
                        <div className={s.firstLineWrap}>
                            <span className={s.redLine} aria-hidden="true" />
                            <span className={s.titleLine1}>{content.title1}</span>
                        </div>
                        <span className={s.titleLine2}>{content.title2}</span>
                        <p className={s.tagline}>{content.tagline}</p>
                    </div>

                    <div className={s.buttons}>
                        <a
                            href="https://play.google.com/store/apps/details?id=ua.myastoriya.shop"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={s.storeBtn}
                            aria-label="Google Play"
                        >
                            <Image
                                src="/images/app_promo/googleplay.svg"
                                alt="Google Play"
                                width={135}
                                height={41}
                                className={s.badgeImg}
                            />
                        </a>
                        <a
                            href="https://apps.apple.com/ua/app/myastoriya/id1583915008"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={s.storeBtn}
                            aria-label="App Store"
                        >
                            <Image
                                src="/images/app_promo/app_store.svg"
                                alt="App Store"
                                width={135}
                                height={41}
                                className={s.badgeImg}
                            />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
