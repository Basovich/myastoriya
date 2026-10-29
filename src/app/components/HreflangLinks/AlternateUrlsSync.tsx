'use client';

import { useEffect } from 'react';
import { useAlternateUrls } from '@/hooks/useAlternateUrls';

interface Props {
    languages: Record<string, string>;
}

export default function AlternateUrlsSync({ languages }: Props) {
    const { setAlternateUrls } = useAlternateUrls();

    useEffect(() => {
        setAlternateUrls(languages);
        return () => {
            setAlternateUrls(null);
        };
    }, [languages, setAlternateUrls]);

    return null;
}
