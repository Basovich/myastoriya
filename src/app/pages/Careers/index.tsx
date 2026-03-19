import Header from "@/app/components/Header/Header";
import Footer from "@/app/components/Footer/Footer";
import Breadcrumbs from "@/app/components/ui/Breadcrumbs/Breadcrumbs";
import { Locale } from "@/i18n/config";
import { Dictionary } from "@/i18n/types";
import s from "./Careers.module.scss";
import Image from "next/image";
import {getLocalizedHref} from "@/utils/i18n-helpers";
import Button from "@/app/components/ui/Button/Button";

interface CareersPageProps {
    dict: Dictionary;
    lang: Locale;
}

export default function CareersPage({ dict, lang }: CareersPageProps) {
    const careersPage = dict.home.careersPage;

    return (
        <>
            <Header lang={lang} />
            <main>
                <Breadcrumbs
                    items={[
                        { label: careersPage.breadcrumbs.home, href: "/" },
                        { label: careersPage.breadcrumbs.careers },
                    ]}
                    className={s.breadcrumbsContainer}
                />
                <section className={s.container}>
                    <h1 className={s.title}>
                        {careersPage.hero.title}
                        <br/>
                        {careersPage.hero.subtitle}
                    </h1>
                    <p className={s.text}>{careersPage.about.text}</p>
                    <Button
                        variant="red"
                        href={getLocalizedHref("/careers/apply", lang)}
                        className={s.button}
                    >
                        {careersPage.form.button}
                    </Button>
                    <div className={s.imageWrapper}>
                        <Image
                            src="/images/careers/careers_bg.webp"
                            alt="Careers in Myastoriya"
                            className={s.fullImage}
                            width={340}
                            height={260}
                            priority
                        />
                    </div>
                </section>
            </main>
            <Footer lang={lang} />
        </>
    );
}
