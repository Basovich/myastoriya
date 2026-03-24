import Product from "@/app/pages/Product";

// Define Params type based on App Router conventions
type Props = {
    params: Promise<{ slug: string; lang: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ProductPage({ params }: Props) {
    return (
        <Product params={params} />
    );
}
