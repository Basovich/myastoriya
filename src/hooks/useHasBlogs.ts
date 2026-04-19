'use client';

import { useState, useEffect } from 'react';
import { hasBlogsApi } from '@/lib/graphql/queries/blog';
import { type Locale } from '@/i18n/config';

export function useHasBlogs(lang: Locale) {
    const [hasBlogs, setHasBlogs] = useState(false);

    useEffect(() => {
        hasBlogsApi(lang).then(setHasBlogs);
    }, [lang]);

    return hasBlogs;
}
