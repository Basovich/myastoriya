import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import PersonalLayoutClient from '@/app/components/Personal/PersonalLayoutClient/PersonalLayoutClient';
import type { Metadata } from 'next';
import { Locale } from '@/i18n/config';

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: true,
    },
};

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
