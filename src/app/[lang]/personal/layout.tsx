import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function PersonalLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
        const { lang } = await params;
        redirect(`/${lang === 'ru' ? 'ru' : ''}`);
    }

    return <>{children}</>;
}
