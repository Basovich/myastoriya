'use client';

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

const DEFAULT_FALLBACK = '/images/product-placeholder.svg';

export function getSafeProductImageUrl(src?: string | null, fallback = DEFAULT_FALLBACK): string {
    if (!src || !src.trim()) return fallback;
    const cleanSrc = src.trim();
    if (cleanSrc.startsWith('/images/') || cleanSrc.startsWith('/icons/')) return cleanSrc;
    if (cleanSrc.startsWith('/')) return `https://dev-api.myastoriya.com.ua${cleanSrc}`;
    return cleanSrc;
}

interface SafeProductImageProps extends Omit<ImageProps, 'src'> {
    src?: string | null;
    fallbackSrc?: string;
}

export default function SafeProductImage({
    src,
    fallbackSrc = DEFAULT_FALLBACK,
    alt,
    ...props
}: SafeProductImageProps) {
    const resolvedSrc = getSafeProductImageUrl(src, fallbackSrc);
    const [imgSrc, setImgSrc] = useState<string>(resolvedSrc);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const nextSrc = getSafeProductImageUrl(src, fallbackSrc);
        setImgSrc(nextSrc);
        setHasError(false);
    }, [src, fallbackSrc]);

    return (
        <Image
            {...props}
            src={hasError ? fallbackSrc : imgSrc}
            alt={alt || 'Product'}
            onError={() => {
                if (!hasError) {
                    setHasError(true);
                    setImgSrc(fallbackSrc);
                }
            }}
        />
    );
}
