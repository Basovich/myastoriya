'use client';

import React, { createContext, useContext } from 'react';

const BaseUrlContext = createContext<string | undefined>(undefined);

export function BaseUrlProvider({
    children,
    baseUrl,
}: {
    children: React.ReactNode;
    baseUrl?: string;
}) {
    return (
        <BaseUrlContext.Provider value={baseUrl}>
            {children}
        </BaseUrlContext.Provider>
    );
}

export function useBaseUrl(): string | undefined {
    return useContext(BaseUrlContext);
}
