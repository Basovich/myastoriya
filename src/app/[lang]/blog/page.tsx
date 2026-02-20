import Header from "@/app/components/Header/Header";
import Footer from "@/app/components/Footer/Footer";
import { Locale } from "@/i18n/config";

export default async function BlogPage({ params }: { params: Promise<{ lang: Locale }> }) {
    const { lang } = await params;

    return (
        <main className="min-h-screen bg-bg-main text-text-primary">
            <Header lang={lang} />

            <div className="container mx-auto px-4 py-20 min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Блог</h1>
                    <p className="text-text-secondary text-lg">Сторінка знаходиться в розробці...</p>
                </div>
            </div>

            <Footer lang={lang} />
        </main>
    );
}
