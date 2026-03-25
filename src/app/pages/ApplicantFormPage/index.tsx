import Header from "@/app/components/Header/Header";
import Footer from "@/app/components/Footer/Footer";
import Breadcrumbs from "@/app/components/ui/Breadcrumbs/Breadcrumbs";
import { Locale } from "@/i18n/config";
import { Dictionary } from "@/i18n/types";
import s from "./ApplicantFormPage.module.scss";
import ApplicantForm from "@/app/components/ApplicantForm/ApplicantForm";
import Image from "next/image";

interface ApplicantFormPageProps {
    dict: Dictionary;
    lang: Locale;
}

export default function ApplicantFormPage({ dict, lang }: ApplicantFormPageProps) {
    const applicantFormPageDict = dict.home.applicantFormPage;

    return (
        <>
            <Header lang={lang} />
            <main>
                <Breadcrumbs
                    items={[
                        { label: applicantFormPageDict.breadcrumbs.home, href: "/" },
                        { label: applicantFormPageDict.breadcrumbs.careers, href: "/careers" },
                        { label: applicantFormPageDict.breadcrumbs.apply },
                    ]}
                    className={s.breadcrumbsContainer}
                />
                <section className={s.container}>
                    <div className={s.imageWrapper}>
                        <Image
                            src="/images/careers/careers_form.webp" 
                            alt={applicantFormPageDict.title} 
                            className={s.formImage}
                            width={320}
                            height={180}
                        />
                    </div>
                    <h1 className={s.title}>{applicantFormPageDict.title}</h1>
                    <ApplicantForm dict={applicantFormPageDict.form} />
                </section>
            </main>
            <Footer lang={lang} />
        </>
    );
}
