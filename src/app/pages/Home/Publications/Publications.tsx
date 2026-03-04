import s from "./Publications.module.scss";
import SectionHeader from "../../../components/ui/SectionHeader/SectionHeader";
import Button from "../../../components/ui/Button/Button";
import Link from "next/link";
import Image from "next/image";
import { Locale } from "@/i18n/config";
import type { Publication } from "@/i18n/types";

interface PublicationsProps {
  dict: {
    sectionTitle: string;
    showAllButton: string;
    items: Publication[];
  };
  lang: Locale;
}

export default function Publications({ dict, lang }: PublicationsProps) {

    return (
        <section className={s.section} id="publications">
            <div className={s.headerWrap}>
                <SectionHeader title={dict.sectionTitle} />
            </div>
            <div className={s.carousel}>
                {dict.items.map((pub) => (
                    <Link href={`/${lang}/blog/${pub.id}`} key={pub.id} className={s.card}>
                        <div className={s.imageWrap}>
                            <Image src={pub.image} alt={pub.title} fill className={s.cardImg} />
                        </div>
                        <div className={s.info}>
                            <span className={s.date}>{pub.dateRange}</span>
                            <h3 className={s.title} title={pub.title}>{pub.title}</h3>
                        </div>
                    </Link>
                ))}
            </div>
            <div className={s.allBtn}>
                <Button variant="outline-black" href={`${lang === 'ua' ? '/' : 'ru/'}blog`} className={s.blogLink}>
                    <span className={s.blogLinkText}>{dict.showAllButton}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="15" viewBox="0 0 18 15" fill="none">
                        <path d="M9.98565 1.00019L16.3141 7.32861L9.98565 13.657" stroke="black" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="15" y1="7.17139" x2="1" y2="7.17139" stroke="black" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </Button>
            </div>
        </section>
    );
}
