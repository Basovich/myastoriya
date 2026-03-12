import Filter from "@/app/pages/Filter";


export default function FilterPage({ params }: { params: Promise<{ lang: string }> }) {
    return (
        <Filter params={params} />
    );
}
