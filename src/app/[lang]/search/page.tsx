import Search from "@/app/pages/Search";


export default function SearchPage({ params }: { params: Promise<{ lang: string }> }) {
    return (
        <Search params={params} />
    );
}
