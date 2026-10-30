'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import FaqAccordion from '@/app/components/ui/FaqAccordion/FaqAccordion';
import type { FaqQuestion } from '@/lib/graphql';
import { parseFilterParams, parseRawProductionParam } from '@/utils/filter-params';
import s from '../CatalogContent/CatalogContent.module.scss';

interface CatalogFaqClientProps {
    initialFaq?: FaqQuestion[] | null;
}

export default function CatalogFaqClient({ initialFaq }: CatalogFaqClientProps) {
    const searchParams = useSearchParams();
    const [clientPage, setClientPage] = useState<number>(1);

    useEffect(() => {
        const handlePageChange = (e: Event) => {
            const customEvent = e as CustomEvent<{ page: number }>;
            if (typeof customEvent.detail?.page === 'number') {
                setClientPage(customEvent.detail.page);
            }
        };

        window.addEventListener('catalog-page-changed', handlePageChange);
        return () => window.removeEventListener('catalog-page-changed', handlePageChange);
    }, []);

    // Sync clientPage back to 1 if searchParams changes and page is 1 or missing
    const pageParam = searchParams.get('page');
    const pageNum = pageParam ? parseInt(pageParam, 10) : 1;

    if (!initialFaq || initialFaq.length === 0) {
        return null;
    }

    const isPageGreaterThanOne = pageNum > 1 || clientPage > 1;
    const hasSort = Boolean(searchParams.get('sort'));
    const hasRawParam = parseRawProductionParam(searchParams) !== undefined;
    const activeFilters = parseFilterParams(searchParams);
    const hasFilters = activeFilters.length > 0 || hasRawParam;

    if (isPageGreaterThanOne || hasSort || hasFilters) {
        return null;
    }

    return (
        <div className={s.faqSection}>
            <div className={s.relatedInner}>
                <FaqAccordion items={initialFaq} />
            </div>
        </div>
    );
}
