import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Header from '@/app/components/Header/Header';
import Footer from '@/app/components/Footer/Footer';
import PersonalLayoutClient from '@/app/components/Personal/PersonalLayoutClient/PersonalLayoutClient';
import { Locale } from '@/i18n/config';

export default async function PersonalLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
        redirect(`/${lang === 'ru' ? 'ru' : ''}`);
    }

    return (
        <PersonalLayoutClient lang={lang as Locale}>
            {children}
        </PersonalLayoutClient>
    );
}
