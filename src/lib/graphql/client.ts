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
 * Helper to detect files/blobs in variables
 */
const isFile = (val: unknown): val is File | Blob => 
    (typeof File !== 'undefined' && val instanceof File) || 
    (typeof Blob !== 'undefined' && val instanceof Blob);

/**
 * Deeply extract files and their paths from a variables object
 */
const getFiles = (obj: any, path = ''): Array<{ path: string, file: File | Blob }> => {
    let files: Array<{ path: string, file: File | Blob }> = [];
    if (!obj || typeof obj !== 'object') return files;

    for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : `variables.${key}`;
        if (isFile(value)) {
            files.push({ path: currentPath, file: value });
        } else if (value && typeof value === 'object') {
            files = files.concat(getFiles(value, currentPath));
        }
    }
    return files;
};

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

    let body: BodyInit = JSON.stringify({ query, variables });

    // Handle File Uploads (GraphQL Multipart Request Spec)
    const files = getFiles(variables);
    if (files.length > 0) {
        const formData = new FormData();
        
        // 1. operations - replace files with null
        const variablesWithNulls = JSON.parse(JSON.stringify(variables, (_key, value) => {
            // Check if value is one of the files we found
            if (files.some(f => f.file === value)) return null;
            return value;
        }));
        
        formData.append('operations', JSON.stringify({ query, variables: variablesWithNulls }));

        // 2. map - map indexes to variable paths
        const map: Record<string, string[]> = {};
        files.forEach((fileInfo, index) => {
            map[index.toString()] = [fileInfo.path];
        });
        formData.append('map', JSON.stringify(map));

        // 3. files - append binary data
        files.forEach((fileInfo, index) => {
            formData.append(index.toString(), fileInfo.file);
        });

        body = formData;
        delete headers['Content-Type']; // Let browser set boundary
    }

    const res = await fetch(GQL_ENDPOINT, {
        method: 'POST',
        headers,
        credentials: 'include',
        body,
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
