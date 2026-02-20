import s from "./Publications.module.scss";
import SectionHeader from "../ui/SectionHeader/SectionHeader";
import Button from "../ui/Button/Button";
import Link from "next/link";
import Image from "next/image";
import { Locale } from "@/i18n/config";

export default function Publications({ dict, lang }: { dict: any, lang: Locale }) {

    return (
        <section className={s.section} id="publications">
            <div className={s.headerWrap}>
                <SectionHeader title={dict.sectionTitle} align="left" />
            </div>
            <div className={s.carousel}>
                {dict.items.map((pub: any) => (
                    <Link href={`/${lang}/blog/${pub.id}`} key={pub.id} className={s.card}>
                        <div className={s.imageWrap}>
                            <Image src={pub.image} alt={pub.title} fill className={s.cardImg} />
                        </div>
                        <div className={s.info}>
                            <span className={s.date}>{pub.dateRange}</span>
                            <h3 className={s.title}>{pub.title}</h3>
                        </div>
                    </Link>
                ))}
            </div>
            <div className={s.allBtn}>
                <Button variant="outline-black" href={`/${lang}/blog`} className={s.black}>
                    {dict.showAllButton}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
                    </svg>
                </Button>
            </div>
        </section>
    );
}
