import { Locale } from "@/i18n/config";
import ShoppingListClient from "@/app/components/Personal/ShoppingList/ShoppingListClient";

export const metadata = {
    title: 'Список покупок',
    robots: { index: false, follow: true },
};

export default async function ShoppingListPage({
    params,
}: {
    params: Promise<{ lang: Locale }>;
}) {
    const { lang } = await params;

    return <ShoppingListClient lang={lang} />;
}
