import Link from "next/link";
import Image from "next/image";
import { type Locale } from "@/i18n/config";
import { getLocalizedHref } from "@/utils/i18n-helpers";
import s from "./Logo.module.scss";

interface LogoProps {
    lang: Locale;
    className?: string;
}

export default function Logo({ lang, className }: LogoProps) {
    return (
        <Link href={getLocalizedHref("/", lang)} className={`${s.logo} ${className || ''}`}>
            <Image
                src="/images/logo-white.svg"
                alt="М'ясторія"
                width={114}
                height={33}
                className={s.logoImg}
                priority
            />
        </Link>
    );
}
