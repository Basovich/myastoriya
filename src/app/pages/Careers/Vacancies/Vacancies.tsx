import Image from "next/image";
import s from "./Vacancies.module.scss";

export default function Vacancies() {
    return (
        <section className={s.vacancies}>
            <div className={s.collage}>
                {/* Left column */}
                <div className={s.colLeft}>
                    <div className={s.photoWrap}>
                        <Image
                            src="/images/careers/careers_photo_1.png"
                            alt="Команда М'ясторія"
                            fill
                            className={s.photo}
                            sizes="(min-width: 1024px) 240px, 50vw"
                        />
                    </div>
                    <div className={s.photoWrap}>
                        <Image
                            src="/images/careers/careers_photo_7.png"
                            alt="Команда М'ясторія"
                            fill
                            className={s.photo}
                            sizes="(min-width: 1024px) 240px, 50vw"
                        />
                    </div>
                </div>

                {/* Center-left column */}
                <div className={s.colCenterLeft}>
                    <div className={s.photoWrap}>
                        <Image
                            src="/images/careers/careers_photo_2.png"
                            alt="Команда М'ясторія"
                            fill
                            className={s.photo}
                            sizes="(min-width: 1024px) 240px, 50vw"
                        />
                    </div>
                </div>

                {/* Center column */}
                <div className={s.colCenter}>
                    <div className={s.photoWrap}>
                        <Image
                            src="/images/careers/careers_photo_3.png"
                            alt="Команда М'ясторія"
                            fill
                            className={s.photo}
                            sizes="(min-width: 1024px) 240px, 50vw"
                        />
                    </div>
                    <div className={s.photoWrap}>
                        <Image
                            src="/images/careers/careers_photo_4.png"
                            alt="Команда М'ясторія"
                            fill
                            className={s.photo}
                            sizes="(min-width: 1024px) 240px, 50vw"
                        />
                    </div>
                </div>

                {/* Right column */}
                <div className={s.colRight}>
                    <div className={s.photoWrap}>
                        <Image
                            src="/images/careers/careers_photo_5.png"
                            alt="Команда М'ясторія"
                            fill
                            className={s.photo}
                            sizes="(min-width: 1024px) 240px, 50vw"
                        />
                    </div>
                    <div className={s.photoWrap}>
                        <Image
                            src="/images/careers/careers_photo_6.png"
                            alt="Команда М'ясторія"
                            fill
                            className={s.photo}
                            sizes="(min-width: 1024px) 505px, 100vw"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
