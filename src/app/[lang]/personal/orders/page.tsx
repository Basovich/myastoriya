import { Locale } from '@/i18n/config';
import OrdersClient from '@/app/components/Personal/Orders/OrdersClient';

export const metadata = {
    title: 'Історія замовлень',
};

export default async function OrdersPage({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    return <OrdersClient lang={lang as Locale} />;
}
