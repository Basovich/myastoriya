import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import HomePage from "@/app/pages/Home";
import { getBlogsApi, getSlidesApi } from "@/lib/graphql";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  const [blogsResponse, slides] = await Promise.all([
    getBlogsApi({ limit: 4 }),
    getSlidesApi("main"),
  ]);

  return (
      <HomePage lang={lang} dict={dict} publications={blogsResponse.data} slides={slides} />
  );
}
