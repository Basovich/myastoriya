// Server Component — без 'use client'
// Рендерить вміст фільтрів у HTML для SEO-павуків (візуально прихований)
import type { FilterBlock } from '@/lib/graphql';

interface CatalogFiltersSsrListProps {
    filterBlocks?: FilterBlock[];
}

export default function CatalogFiltersSsrList({ filterBlocks }: CatalogFiltersSsrListProps) {
    if (!filterBlocks || filterBlocks.length === 0) return null;

    return (
        // Візуально прихований блок — контент присутній у HTML для SEO/павуків
        <div
            aria-hidden="true"
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
            {filterBlocks.map((block) => (
                <div key={block.key ?? block.label}>
                    <p>{block.label}</p>
                    {block.values?.map((val) => (
                        <span key={val.key ?? val.label}>{val.label}</span>
                    ))}
                </div>
            ))}
        </div>
    );
}
