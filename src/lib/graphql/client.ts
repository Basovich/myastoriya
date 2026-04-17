const isServer = typeof window === 'undefined';
const GQL_ENDPOINT = isServer 
    ? 'https://dev-api.myastoriya.com.ua/graphql' 
    : '/api/graphql';

export interface GqlError {
    message: string;
    locations?: { line: number; column: number }[];
    path?: string[];
    extensions?: Record<string, unknown>;
}

export interface GqlResponse<T> {
    data?: T;
    errors?: GqlError[];
}

export class GraphQLError extends Error {
    constructor(
        message: string,
        public readonly errors: GqlError[],
    ) {
        super(message);
        this.name = 'GraphQLError';
    }
}

interface RequestOptions {
    /** Access token for authenticated requests */
    token?: string;
    /** Current locale ('ua' or 'ru') */
    lang?: string;
    /** Next.js cache / revalidate options (server-side only) */
    next?: NextFetchRequestConfig;
}

/**
 * Base GraphQL fetch. Returns typed `data` or throws `GraphQLError`.
 */
export async function gqlRequest<T>(
    query: string,
    variables?: Record<string, unknown>,
    options?: RequestOptions,
): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (options?.token) {
        headers['Authorization'] = `Bearer ${options.token}`;
    }

    const langHeader = options?.lang === 'ru' ? 'ru_RU' : 'uk_UA';
    headers['Content-Language'] = langHeader;

    const res = await fetch(GQL_ENDPOINT, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ query, variables }),
        ...(options?.next ? { next: options.next } : {}),
    });

    if (!res.ok) {
        throw new Error(`Network error: ${res.status} ${res.statusText}`);
    }

    const json: GqlResponse<T> = await res.json();

    if (json.errors?.length) {
        const error = json.errors[0];
        let errorMessage = error.message;

        // Extract deep validation messages if present
        if (error.extensions && error.extensions.validation) {
            const validation = error.extensions.validation as Record<string, string[]>;
            const firstKey = Object.keys(validation)[0];
            if (firstKey && validation[firstKey] && validation[firstKey].length > 0) {
                errorMessage = validation[firstKey][0];
            }
        }

        throw new GraphQLError(errorMessage, json.errors);
    }

    if (json.data === undefined) {
        throw new Error('No data returned from GraphQL');
    }

    return json.data;
}
