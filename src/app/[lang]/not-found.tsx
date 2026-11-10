import type { Metadata } from "next";
import { headers } from "next/headers";
import { permanentRedirect } from "next/navigation";
import NotFoundBlock from "@/app/components/NotFoundBlock/NotFoundBlock";
import { getDictionary } from "@/i18n/get-dictionary";
import { type Locale } from "@/i18n/config";
import { fetchSeoMetadataByUrl } from "@/utils/seo";
import { getRedirectByUrlApi } from "@/lib/graphql/queries/seo";

async function resolveLang(): Promise<Locale> {
    const pathname = (await headers()).get("x-pathname") || "";
    return pathname === "/ru" || pathname.startsWith("/ru/") ? "ru" : "ua";
}

export async function generateMetadata(): Promise<Metadata> {
    const lang = await resolveLang();
    const seo = await fetchSeoMetadataByUrl(`/${lang}/404/`, lang).catch(() => null);
    const fallbackTitle = lang === "ru" ? "Страница не найдена | Мястория" : "Сторінку не знайдено | М'ясторія";
    return {
        title: { absolute: seo?.title || fallbackTitle },
        ...(seo?.description ? { description: seo.description } : {}),
        robots: {
            index: false,
            follow: false,
        },
    };
}

export default async function LangNotFound() {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || "";
    const lang: Locale = pathname === "/ru" || pathname.startsWith("/ru/") ? "ru" : "ua";

    // Перевіряємо 301 редирект з бекенду (Wezom CMS) перед відображенням 404
    if (pathname) {
        const redirectTarget = await getRedirectByUrlApi(pathname, lang);
        if (redirectTarget) {
            permanentRedirect(redirectTarget);
        }
    }

    const dict = await getDictionary(lang);

    return (
        <main>
            <NotFoundBlock dict={dict} lang={lang} />
        </main>
    );
}
