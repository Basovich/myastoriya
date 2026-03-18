import Link from "next/link";
import { type Locale } from "@/i18n/config";
import { getLocalizedHref } from "@/utils/i18n-helpers";
import s from "./ApplicantForm.module.scss";

interface ApplicantFormProps {
    buttonText: string;
    lang: Locale;
}

export default function ApplicantForm({ buttonText, lang }: ApplicantFormProps) {
    return (
        <section className={s.section}>
            <div className={s.container}>
                <div className={s.content}>
                    <Link
                        href={getLocalizedHref("#", lang)}
                        className={s.button}
                    >
                        {buttonText}
                    </Link>
                </div>
            </div>
        </section>
    );
}
