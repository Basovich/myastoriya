import { Metadata } from 'next';
import { getMeApi } from '@/lib/graphql/queries/auth';
import { getAccessToken } from '@/app/actions/authActions';
import CardsClient from '@/app/components/Personal/Cards/CardsClient';

export const metadata: Metadata = {
  title: 'Банківські картки | М\'ясторія',
};

export default async function BankCardsPage(props: { params: Promise<{ lang: string }> }) {
  const { lang } = await props.params;
  const token = await getAccessToken();
  const user = token ? await getMeApi(token) : null;

  return <CardsClient user={user} lang={lang as 'ua' | 'ru'} />;
}
