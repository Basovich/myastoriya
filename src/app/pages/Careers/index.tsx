import Breadcrumbs from "@/app/components/ui/Breadcrumbs/Breadcrumbs";
import { Locale } from "@/i18n/config";
import { Dictionary } from "@/i18n/types";
import s from "./Careers.module.scss";
import Image from "next/image";
import Button from "@/app/components/ui/Button/Button";
import { Career } from "@/lib/graphql";

interface CareersPageProps {
    dict: Dictionary;
    lang: Locale;
    careerData?: Career | null;
    h1?: string;
}

export default function CareersPage({ dict, careerData, h1 }: CareersPageProps) {
    const careersPage = dict.home.careersPage;

    return (
        <>
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
                        {h1 ? (
                            h1
                        ) : careerData?.title ? (
                            <span dangerouslySetInnerHTML={{ __html: careerData.title }} />
                        ) : (
                            <>
                                {careersPage.hero.title}
                                <br/>
                                {careersPage.hero.subtitle}
                            </>
                        )}
                    </h1>
                    {careerData?.text ? (
                        <div
                            className={s.text}
                            dangerouslySetInnerHTML={{ __html: careerData.text.replace(/<h1([\s>])/gi, '<h2$1').replace(/<\/h1>/gi, '</h2>') }}
                        />
                    ) : (
                        <p className={s.text}>{careersPage.about.text}</p>
                    )}
                    <Button
                        variant="red"
                        href="/careers/apply"
                        className={s.button}
                    >
                        {careerData?.buttonText || careersPage.form.button}
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
        </>
    );
}
