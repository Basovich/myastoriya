import type { Metadata } from "next";
import { headers } from "next/headers";
import NotFoundBlock from "@/app/components/NotFoundBlock/NotFoundBlock";
import { getDictionary } from "@/i18n/get-dictionary";
import { type Locale } from "@/i18n/config";

async function resolveLang(): Promise<Locale> {
    const pathname = (await headers()).get("x-pathname") || "";
    return pathname === "/ru" || pathname.startsWith("/ru/") ? "ru" : "ua";
}

export async function generateMetadata(): Promise<Metadata> {
    const lang = await resolveLang();
    return {
        title: {
            absolute: lang === "ru" ? "Страница не найдена | Мястория" : "Сторінку не знайдено | М'ясторія",
        },
    };
}

export default async function LangNotFound() {
    const lang = await resolveLang();
    const dict = await getDictionary(lang);

    return (
        <main>
            <NotFoundBlock dict={dict} />
        </main>
    );
}
