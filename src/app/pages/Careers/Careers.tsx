import Header from "@/app/components/Header/Header";
import Footer from "@/app/components/Footer/Footer";
import Breadcrumbs from "@/app/components/ui/Breadcrumbs/Breadcrumbs";
import CareersHero from "./Hero/CareersHero";
import AboutSection from "./AboutSection/AboutSection";
import ApplicantForm from "./ApplicantForm/ApplicantForm";
import { Locale } from "@/i18n/config";
import { Dictionary } from "@/i18n/types";
import s from "./Careers.module.scss";

interface CareersPageProps {
  dict: Dictionary;
  lang: Locale;
}

export default function CareersPage({ dict, lang }: CareersPageProps) {
    const careersPage = dict.home.careersPage;

    return (
        <>
            <Header lang={lang} />
            <main className={s.main}>
                <div className={`${s.container} ${s.breadcrumbsContainer}`}>
                    <Breadcrumbs
                        items={[
                            { label: careersPage.breadcrumbs.home, href: "/" },
                            { label: careersPage.breadcrumbs.careers },
                        ]}
                    />
                </div>

                <CareersHero
                    title={careersPage.hero.title}
                    subtitle={careersPage.hero.subtitle}
                />

                <AboutSection
                    title={careersPage.about.title}
                    text={careersPage.about.text}
                />

                <ApplicantForm
                    buttonText={careersPage.form.button}
                    lang={lang}
                />

                <section className={s.imageSection}>
                    <div className={s.container}>
                        <div className={s.imageWrapper}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                                src="/images/careers/careers_bg.png" 
                                alt="Careers in Myastoriya" 
                                className={s.fullImage}
                            />
                        </div>
                    </div>
                </section>
            </main>
            <Footer lang={lang} />
        </>
    );
}
