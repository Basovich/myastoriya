import s from "./Publications.module.scss";
import SectionHeader from "../ui/SectionHeader/SectionHeader";
import Button from "../ui/Button/Button";
import AppLink from "@/app/components/ui/AppLink/AppLink";
import Image from "next/image";
import { Locale } from "@/i18n/config";
import clsx from "clsx";
import type { BlogPost } from "@/lib/graphql";

interface PublicationsProps {
  dict: {
    sectionTitle: string;
    showAllButton: string;
  };
  posts: BlogPost[];
  lang: Locale;
  className?: string;
}

export default function Index({ dict, posts, lang, className }: PublicationsProps) {
    if (!posts || posts.length === 0) {
        return null;
    }

    const formatDate = (iso: string | null) => {
        if (!iso) return "";
        return new Date(iso).toLocaleDateString("uk-UA", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    return (
        <section className={clsx(s.section, className)} id="publications">
            <div className={s.headerWrap}>
                <SectionHeader title={dict.sectionTitle} />
            </div>
            <div className={s.carousel}>
                {posts.map((pub) => (
                    <AppLink href={`/blog/${pub.slug}`} key={pub.id} className={s.card}>
                        <div className={s.imageWrap}>
                            {pub.image?.url?.size2x ? (
                                <Image src={pub.image.url.size2x} alt={pub.name} fill className={s.cardImg} sizes="(max-width: 768px) 100vw, 33vw" />
                            ) : (
                                <div className={s.cardImgPlaceholder} />
                            )}
                        </div>
                        <div className={s.info}>
                            <span className={s.date}>{formatDate(pub.publishedAt)}</span>
                            <h3 className={s.title} title={pub.name}>{pub.name}</h3>
                        </div>
                    </AppLink>
                ))}
            </div>
            <div className={s.allBtn}>
                <Button variant="outline-black" href="/blog" className={s.blogLink}>
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
