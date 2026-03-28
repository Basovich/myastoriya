import CategoryCatalog from "@/app/pages/CategoryCatalog";

export default function CategoryCatalogPage({
    params,
}: {
    params: Promise<{ lang: string; category: string }>;
}) {
    return <CategoryCatalog params={params} />;
}
