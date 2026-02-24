"use client";

import { useSearchParams } from "next/navigation";
import { use } from "react";

export default function SearchPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = use(params);
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";

    return (
        <div style={{ padding: "100px 20px", textAlign: "center", color: "#222" }}>
            <h1>Результати пошуку для: "{query}"</h1>
            <p style={{ marginTop: "20px" }}>Мова: {lang}</p>
        </div>
    );
}
