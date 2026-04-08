import Product from "@/app/pages/Product";
import { getBlogsApi } from "@/lib/graphql";

// Define Params type based on App Router conventions
type Props = {
    params: Promise<{ slug: string; lang: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ProductPage({ params }: Props) {
    const blogsResponse = await getBlogsApi({ limit: 4 });

    return (
        <Product params={params} publications={blogsResponse.data} />
    );
}

