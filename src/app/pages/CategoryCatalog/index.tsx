import { use } from "react";
import Header from "@/app/components/Header/Header";
import { Locale } from "@/i18n/config";
import CatalogContent from "@/app/pages/Catalog/CatalogContent";
import Footer from "@/app/components/Footer/Footer";



const CATEGORY_LABELS: Record<string, string> = {
    'litne-menu': 'Літнє меню',
    'vizmy-z-soboyu': 'Візьми з собою',
    'nabory-dlya-kompaniyi': 'Набори для компанії',
    'gryl-menu': 'Гриль-меню',
    'restoranne-menu': 'Ресторанне меню',
    'burgery': 'Бургери',
    'dytyache-menu': 'Дитяче меню',
    'vlasne-vyrobnytstvo': 'Власне виробництво',
    'myasna-produktsiya': "М'ясна продукція",
    'konservatsiya': 'Консервація',
    'syry': 'Сири',
    'maslo': 'Масло',
    'sousy': 'Соуси',
    'napoyi': 'Напої',
    'khlib-ta-vypichka': 'Хліб та випічка',
    'morozyvo-gelarty': 'Морозиво Gelarty',
    'solodoshchi': 'Солодощі',
    'kava': 'Кава',
    'med': 'Мед',
    'shashylk': 'Шашлик',
};

interface CategoryCatalogProps {
    params: Promise<{ lang: string; category: string }>;
}

export default function CategoryCatalog({ params }: CategoryCatalogProps) {
    const { lang, category } = use(params);

    return (
        <>
            <Header lang={lang as Locale} />
            <main>
                <CatalogContent category={CATEGORY_LABELS[category]} />
            </main>
            <Footer lang={lang as Locale} />
        </>
    );
}
