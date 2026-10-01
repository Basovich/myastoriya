// Server Component — без 'use client'
import { getCategoryHref } from '@/utils/category-url';
import { getLocalizedHref } from '@/utils/i18n-helpers';
import { ProductCategory } from '@/lib/graphql/queries/products';
import { Locale } from '@/i18n/config';

interface CatalogMenuSsrLinksProps {
    categories: ProductCategory[];
    lang: Locale;
}

function collectAllCategories(categories: ProductCategory[]): ProductCategory[] {
    const result: ProductCategory[] = [];
    const traverse = (cats: ProductCategory[]) => {
        for (const cat of cats) {
            if (cat.slug) result.push(cat);
            if (cat.children?.length) traverse(cat.children);
        }
    };
    traverse(categories);
    return result;
}

export default function CatalogMenuSsrLinks({ categories, lang }: CatalogMenuSsrLinksProps) {
    const allCategories = collectAllCategories(categories);

    if (!allCategories.length) return null;

    return (
        // Візуально прихований блок — контент присутній у HTML для SEO/павуків
        <nav
            aria-label={lang === 'ru' ? 'Каталог категорий' : 'Каталог категорій'}
            style={{
                position: 'absolute',
                width: '1px',
                height: '1px',
                padding: 0,
                margin: '-1px',
                overflow: 'hidden',
                clip: 'rect(0,0,0,0)',
                whiteSpace: 'nowrap',
                border: 0,
            }}
        >
            {allCategories.map((cat) => {
                const canonicalHref = getCategoryHref(cat);
                const localizedHref = getLocalizedHref(canonicalHref, lang);
                return (
                    <a key={cat.id} href={localizedHref}>
                        {cat.name}
                    </a>
                );
            })}
        </nav>
    );
}
