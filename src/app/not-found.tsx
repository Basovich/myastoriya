import { Suspense } from "react";
import { headers } from "next/headers";
import { permanentRedirect } from "next/navigation";
import localFont from "next/font/local";
import "./globals.css";
import { getDictionary } from "@/i18n/get-dictionary";
import { getCatalogTreeApi, type ProductCategory } from "@/lib/graphql/queries/products";
import { getSocialLinksApi, type SocialLink } from "@/lib/graphql/queries/settings";
import { getAccessToken } from "@/app/actions/authActions";
import ReduxProvider from "@/store/ReduxProvider";
import { CategoryProvider } from "@/hooks/useCategoryTree";
import Header from "@/app/components/Header/HeaderClient";
import Footer from "@/app/components/Footer/FooterClient";
import AuthInitializer from "@/app/components/AuthInitializer/AuthInitializerClient";
import StatusModals from "@/app/components/StatusModals/StatusModals";
import NotFoundBlock from "@/app/components/NotFoundBlock/NotFoundBlock";
import { type Locale } from "@/i18n/config";
import clsx from "clsx";
import { fetchSeoMetadataByUrl } from "@/utils/seo";
import { getRedirectByUrlApi } from "@/lib/graphql/queries/seo";

const houschka = localFont({
    src: [
        {
            path: "../fonts/HouschkaRounded-Bold.woff2",
            weight: "700",
            style: "normal",
        },
        {
            path: "../fonts/HouschkaRounded-ExtraBold.woff2",
            weight: "800",
            style: "normal",
        },
    ],
    variable: "--font-houschka",
});

const helios = localFont({
    src: [
        {
            path: "../fonts/Helios-Regular.woff2",
            weight: "400",
            style: "normal",
        },
        {
            path: "../fonts/Helios-Bold.woff2",
            weight: "700",
            style: "normal",
        },
    ],
    variable: "--font-helios",
});

export default async function GlobalNotFound() {
    let lang: Locale = "ua";
    let pathname = "";
    try {
        const headersList = await headers();
        pathname = headersList.get("x-pathname") || "";
        if (pathname.startsWith("/ru/") || pathname === "/ru") {
            lang = "ru";
        }
    } catch {
        // Fallback to default locale
    }

    // Перевіряємо 301 редирект з бекенду (Wezom CMS) перед відображенням 404
    if (pathname) {
        try {
            const redirectTarget = await getRedirectByUrlApi(pathname, lang);
            if (redirectTarget) {
                permanentRedirect(redirectTarget);
            }
        } catch (e) {
            // Next.js permanentRedirect throws NEXT_REDIRECT, rethrow it
            if (e && typeof e === 'object' && 'digest' in e) {
                throw e;
            }
        }
    }

    let catalogTree: ProductCategory[] = [];
    let socialLinks: SocialLink[] = [];
    try {
        const token = await getAccessToken();
        const [tree, links] = await Promise.all([
            getCatalogTreeApi(lang, 768, token ?? undefined).catch(() => [] as ProductCategory[]),
            getSocialLinksApi().catch(() => [] as SocialLink[]),
        ]);
        catalogTree = tree;
        socialLinks = links;
    } catch {
        // Fallback to empty arrays
    }

    const dict = await getDictionary(lang);
    const seoTitle = (await fetchSeoMetadataByUrl(`/${lang}/404/`, lang).catch(() => null))?.title || "";
    const htmlLang = lang === 'ua' ? 'uk' : lang;

    return (
        <html lang={htmlLang} className={clsx(houschka.variable, helios.variable)} suppressHydrationWarning>
            <head>
                <title>{seoTitle || (lang === 'ru' ? 'Страница не найдена | Мястория' : "Сторінку не знайдено | М'ясторія")}</title>
                <meta name="robots" content="noindex, nofollow" />
            </head>
            <body>
                <ReduxProvider>
                    <CategoryProvider initialCategories={catalogTree}>
                        {/* Suspense is required because Header, StatusModals use useSearchParams() */}
                        <Suspense fallback={null}>
                            <AuthInitializer />
                            <Header lang={lang} initialCategories={catalogTree} />
                        </Suspense>
                        <main>
                            <NotFoundBlock dict={dict} lang={lang} />
                        </main>
                        <Footer lang={lang} initialSocialLinks={socialLinks} />
                        <Suspense fallback={null}>
                            <StatusModals lang={lang} />
                        </Suspense>
                    </CategoryProvider>
                </ReduxProvider>
            </body>
        </html>
    );
}
