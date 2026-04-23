import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import ContactsPage from "@/app/pages/Contacts";
import { getContactsShopsApi } from "@/lib/graphql";
import { contactsData } from "@/app/pages/Contacts/contacts.content";

export default async function Contacts({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  
  // Fetch restaurants from API using optimized Contacts query
  const shopsRes = await getContactsShopsApi({ limit: 100, onlyCompanyStores: true }, lang);
  const shops = shopsRes?.shops?.data || [];
  
  // Use callCenter info from JSON as fallback/source for office
  const { callCenter } = contactsData;

  return (
      <ContactsPage 
        lang={lang} 
        dict={dict} 
        shops={shops} 
        callCenter={callCenter} 
      />
  );
}
