import AppLink from "@/app/components/ui/AppLink/AppLink";
import Image from "next/image";
import { type Locale } from "@/i18n/config";
import { getLocalizedHref } from "@/utils/i18n-helpers";
import clsx from "clsx";
import s from "./Logo.module.scss";

interface LogoProps {
    lang: Locale;
    className?: string;
    theme?: string;
}

export default function Logo({ lang, className, theme = 'white' }: LogoProps) {
    return (
        <AppLink href="/" className={clsx(s.logo, className)}>
            <Image
                src={theme === 'black' ? "/images/logo-black.svg" : "/images/logo-white.svg"}
                alt="М'ясторія"
                width={114}
                height={33}
                className={s.logoImg}
                priority
            />
        </AppLink>
    );
}
