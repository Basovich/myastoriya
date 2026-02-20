import { getDictionary } from "@/i18n/get-dictionary";
import Footer from "../../../components/Footer/Footer";
import Header from "../../../components/Header/Header";
import Link from "next/link";
import { Locale } from "@/i18n/config";

export default async function BlogDetail({
    params,
}: {
    params: Promise<{ lang: Locale; id: string }>;
}) {
    const { lang, id } = await params;
    const dict = await getDictionary(lang);

    return (
        <>
            <Header lang={lang} />
            <main style={{ paddingTop: "120px", paddingBottom: "60px", minHeight: "80vh", backgroundColor: "#F6F6F6" }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px" }}>
                    <div style={{ marginBottom: "24px", fontSize: "14px", color: "#666" }}>
                        <Link href={lang === 'ua' ? '/' : `/${lang}`} style={{ color: "#222", textDecoration: "none" }}>{dict.home.blogPage.breadcrumbs.home}</Link>
                        <span style={{ margin: "0 8px", color: "#999" }}>»</span>
                        <Link href={lang === 'ua' ? '/blog' : `/${lang}/blog`} style={{ color: "#222", textDecoration: "none" }}>{dict.home.blogPage.breadcrumbs.blog}</Link>
                        <span style={{ margin: "0 8px", color: "#999" }}>»</span>
                        <span style={{ color: "#999" }}>Публікація #{id}</span>
                    </div>

                    <div style={{ background: "#FFF", padding: "40px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                        <h1 style={{ fontSize: "32px", marginBottom: "20px", color: "#222", textTransform: "uppercase" }}>Деталі публікації</h1>
                        <p style={{ fontSize: "16px", color: "#444", lineHeight: "1.6" }}>
                            Це динамічна сторінка для блогу з ідентифікатором: <strong>{id}</strong>.
                            Тут буде розміщено повний текст тексту публікації, фотографії та інший контент.
                        </p>

                        <div style={{ marginTop: "40px" }}>
                            <Link
                                href={lang === 'ua' ? '/blog' : `/${lang}/blog`}
                                style={{
                                    display: "inline-block",
                                    padding: "16px 32px",
                                    backgroundColor: "#E30613",
                                    color: "#FFF",
                                    textDecoration: "none",
                                    fontWeight: "bold",
                                    borderRadius: "8px",
                                    textTransform: "uppercase"
                                }}
                            >
                                Повернутися до блогу
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
            <Footer lang={lang} />
        </>
    );
}
