import { headers } from "next/headers";
import { getDictionary } from "@/i18n/get-dictionary";
import NotFoundBlock from "../components/NotFoundBlock/NotFoundBlock";
import { type Locale } from "@/i18n/config";
export const dynamic = "force-dynamic";

export default async function NotFound() {
    let lang: Locale = "ua";
    try {
        const headersList = await headers();
        const pathname = headersList.get("x-pathname") || headersList.get("x-invoke-path") || "";
        if (pathname.startsWith("/ru/") || pathname === "/ru") {
            lang = "ru";
        }
    } catch {
        // Fallback to default locale
    }
    const dict = await getDictionary(lang);

    return (
        <main>
            <NotFoundBlock dict={dict} />
        </main>
    );
}
