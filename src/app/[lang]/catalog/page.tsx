import Catalog from "@/app/pages/Catalog";

export default function CatalogPage({ params }: { params: Promise<{ lang: string }> }) {
    return (
        <Catalog params={params} />
    );
}
