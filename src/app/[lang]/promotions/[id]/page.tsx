import { getDictionary } from "@/i18n/get-dictionary";
import Footer from "../../../components/Footer/Footer";
import Header from "../../../components/Header/Header";
import Link from "next/link";

// This is the dynamic stub page for individual promotions: /[lang]/promotions/[id]
export default async function PromotionDetail({
    params,
}: {
    params: Promise<{ lang: "ua" | "ru"; id: string }>;
}) {
    const { lang, id } = await params;
    const dict = await getDictionary(lang);

    return (
        <>
            <Header lang={lang} />
            <main style={{ paddingTop: "120px", paddingBottom: "60px", minHeight: "80vh", backgroundColor: "#F6F6F6" }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px" }}>
                    <div style={{ marginBottom: "24px", fontSize: "14px", color: "#666" }}>
                        <Link href={`/${lang}`} style={{ color: "#222", textDecoration: "none" }}>{dict.home.promotionsPage.breadcrumbs.home}</Link>
                        <span style={{ margin: "0 8px", color: "#999" }}>»</span>
                        <Link href={`/${lang}/promotions`} style={{ color: "#222", textDecoration: "none" }}>{dict.home.promotionsPage.breadcrumbs.promotions}</Link>
                        <span style={{ margin: "0 8px", color: "#999" }}>»</span>
                        <span style={{ color: "#999" }}>Акція #{id}</span>
                    </div>

                    <div style={{ background: "#FFF", padding: "40px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                        <h1 style={{ fontSize: "32px", marginBottom: "20px", color: "#222", textTransform: "uppercase" }}>Деталі знижки</h1>
                        <p style={{ fontSize: "16px", color: "#444", lineHeight: "1.6" }}>
                            Це динамічна сторінка для акції з ідентифікатором: <strong>{id}</strong>.
                            Тут буде розміщено повний опис акції, умови, терміни дії та список продуктів, що беруть участь.
                        </p>

                        <div style={{ marginTop: "40px" }}>
                            <Link href={`/${lang}/promotions`} style={{ display: "inline-block", padding: "12px 24px", background: "#E30613", color: "#FFF", borderRadius: "8px", textDecoration: "none", fontWeight: 700 }}>
                                Повернутися до всіх акцій
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
            <Footer lang={lang} />
        </>
    );
}
