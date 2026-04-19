import { headers } from "next/headers";
import { getDictionary } from "@/i18n/get-dictionary";
import NotFoundBlock from "../components/NotFoundBlock/NotFoundBlock";
import { type Locale } from "@/i18n/config";

export default async function NotFound() {
    // Next.js `not-found.tsx` does not receive `params` so we extract locale from headers
    const headersList = await headers();
    const pathname = headersList.get("x-invoke-path") || "";
    const isRu = pathname.startsWith("/ru/") || pathname === "/ru";
    const lang: Locale = isRu ? "ru" : "ua";
    const dict = await getDictionary(lang);

    return (
        <main>
            <NotFoundBlock dict={dict} />
        </main>
    );
}
