import { Locale } from "@/i18n/config";
import ReviewsClient from "@/app/components/Personal/Reviews/ReviewsClient";

export const metadata = {
    title: 'Мої відгуки',
};

export default async function ReviewsPage({
    params,
}: {
    params: Promise<{ lang: Locale }>;
}) {
    const { lang } = await params;

    return <ReviewsClient lang={lang} />;
}
