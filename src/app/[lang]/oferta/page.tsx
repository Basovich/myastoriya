import { Locale } from "@/i18n/config";
import PolicyPage from "@/app/pages/PolicyPage/PolicyPage";
import { ofertaContent } from "@/app/pages/PolicyPage/oferta.content";

export default async function OfertaPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const data = ofertaContent[lang as keyof typeof ofertaContent] || ofertaContent.ua;

  const breadcrumbs = [
    { label: data.breadcrumbs.home, href: "/" },
    { label: data.breadcrumbs.oferta }
  ];

  return (
    <PolicyPage 
      lang={lang} 
      title={data.title}
      breadcrumbs={breadcrumbs}
      content={data.content as any}
    />
  );
}
