import { notFound } from "next/navigation";
import Product from "@/app/pages/Product";

// Define Params type based on App Router conventions
type Props = {
    params: Promise<{ slug: string; lang: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Generate Metadata for SEO
export async function generateMetadata({ params }: Props) {
    const { slug, lang } = await params;

    return {
        title: `Product: ${slug} (${lang}) | Myastoriya`,
        description: `Details about product ${slug}`,
    };
}

export default async function ProductPage({ params }: Props) {
    return (
        <Product params={params} />
    );
}
