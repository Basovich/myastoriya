import { getDictionary } from "@/i18n/get-dictionary";
import ActionsGrid from "../../components/ActionsGrid/ActionsGrid";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";

// This is the index page for Actions: /[lang]/actions
export default async function ActionsPage({
    params,
}: {
    params: Promise<{ lang: "ua" | "ru" }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return (
        <>
            <Header lang={lang} />
            <main>
                <ActionsGrid
                    dict={dict.home.actionsPage}
                    initialItems={dict.home.actions.items}
                    lang={lang}
                    pageType="promotions"
                />
            </main>
            <Footer lang={lang} />
        </>
    );
}
