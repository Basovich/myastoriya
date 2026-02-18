import { notFound } from "next/navigation";

// Define Params type based on App Router conventions
type Props = {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Generate Metadata for SEO
export async function generateMetadata({ params }: Props) {
    const { slug } = await params;

    return {
        title: `Product: ${slug} | Myastoriya`,
        description: `Details about product ${slug}`,
    };
}

export default async function ProductPage({ params }: Props) {
    const { slug } = await params;

    // Simulate fetching product data
    // const product = await getProductBySlug(slug);
    // if (!product) return notFound();

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">Product: {slug}</h1>
            <p className="text-gray-600">
                This is a dynamic page for product ID: <strong>{slug}</strong>
            </p>
            {/* Component for product details would go here */}
        </div>
    );
}
