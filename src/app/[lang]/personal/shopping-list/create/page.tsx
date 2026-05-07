import { Locale } from "@/i18n/config";
import ShoppingListCreateClient from "@/app/components/Personal/ShoppingList/Create/ShoppingListCreateClient";

export const metadata = {
    title: 'Створення списку покупок',
};

export default async function ShoppingListCreatePage({
    params,
}: {
    params: Promise<{ lang: Locale }>;
}) {
    const { lang } = await params;

    return <ShoppingListCreateClient lang={lang} />;
}
