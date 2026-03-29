import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import StoreMenuPage from "@/app/pages/StoreMenu/StoreMenuPage";
import storesData from "@/content/stores.json";
import { notFound } from "next/navigation";

export default async function StoreMenuPageRoute({
    params,
}: {
    params: Promise<{ lang: Locale; id: string }>;
}) {
    const { lang, id } = await params;
    const dict = await getDictionary(lang);

    const store = storesData.find((s) => s.id === id);

    if (!store) {
        notFound();
    }

    return (
        <StoreMenuPage 
            store={store} 
            lang={lang} 
            dict={dict} 
        />
    );
}

export async function generateStaticParams() {
    return storesData.map((store) => ({
        id: store.id,
    }));
}
