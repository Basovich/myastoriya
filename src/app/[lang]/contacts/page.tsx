import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import ContactsPage from "@/app/pages/Contacts";
import { getContactsCategoriesApi } from "@/lib/graphql";

export default async function Contacts({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  
  // Fetch contact categories and nested contacts from API
  const response = await getContactsCategoriesApi(lang);
  const categories = response?.contactCategories || [];

  return (
      <ContactsPage 
        lang={lang} 
        dict={dict} 
        categories={categories} 
      />
  );
}
