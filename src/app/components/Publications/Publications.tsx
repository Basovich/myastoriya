import s from "./Publications.module.scss";
import SectionHeader from "../ui/SectionHeader/SectionHeader";
import Button from "../ui/Button/Button";
import Link from "next/link";
import { Locale } from "@/i18n/config";

export default function Publications({ dict, lang }: { dict: any, lang: Locale }) {

    return (
        <section className={s.section} id="publications">
            <SectionHeader title={dict.sectionTitle} align="left" />
            <div className={s.carousel}>
                {dict.items.map((pub: any) => (
                    <Link href={`/${lang}/blog/${pub.id}`} key={pub.id} className={s.card}>
                        <div className={s.imageWrap}>
                            <img src={pub.image} alt={pub.title} className={s.cardImg} />
                        </div>
                        <div className={s.info}>
                            <span className={s.date}>{pub.dateRange}</span>
                            <h3 className={s.title}>{pub.title}</h3>
                        </div>
                    </Link>
                ))}
            </div>
            <div className={s.allBtn}>
                <Link href={`/${lang}/blog`}>
                    <Button variant="outline">
                        {dict.showAllButton}
                    </Button>
                </Link>
            </div>
        </section>
    );
}
