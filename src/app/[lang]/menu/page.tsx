import { permanentRedirect } from 'next/navigation';
import { Locale } from '@/i18n/config';
import { getRedirectByUrlApi } from '@/lib/graphql/queries/seo';

export const dynamic = 'force-dynamic';

export default async function MenuRootPage({
    params,
}: {
    params: Promise<{ lang: Locale }>;
}) {
    const { lang } = await params;
    const currentPath = `/${lang}/menu/`;
    const target = await getRedirectByUrlApi(currentPath, lang);
    permanentRedirect(target || `/${lang}/category/restoranne-meniu/`);
}

