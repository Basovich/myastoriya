import { getDictionary } from "@/i18n/get-dictionary";
import ActionsGrid from "../../components/ActionsGrid/ActionsGrid";

// This is the index page for Actions: /[lang]/actions
export default async function ActionsPage({
    params,
}: {
    params: Promise<{ lang: "ua" | "ru" }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return (
        <main>
            <ActionsGrid
                dict={dict.home.actionsPage}
                initialItems={dict.home.actions.items}
                lang={lang}
                pageType="promotions"
            />
        </main>
    );
}
