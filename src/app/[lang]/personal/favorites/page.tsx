import { Locale } from '@/i18n/config';
import FavoritesClient from '@/app/components/Personal/Favorites/FavoritesClient';

export const metadata = {
    title: 'Список бажань',
};

export default async function FavoritesPage({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    return <FavoritesClient lang={lang as Locale} />;
}
