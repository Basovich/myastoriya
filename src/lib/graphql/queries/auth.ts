import { gqlRequest } from '../client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LoginInput {
    phone: string;
    password: string;
}

export interface RegisterInput {
    name: string;
    phone: string;
    password: string;
}

export interface AuthPayload {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        name: string;
        phone: string;
        email: string;
    };
}

// ---------------------------------------------------------------------------
// Queries / Mutations
// ---------------------------------------------------------------------------

const LOGIN_MUTATION = /* GraphQL */ `
    mutation Login($phone: String!, $password: String!) {
        login(input: { phone: $phone, password: $password }) {
            accessToken
            refreshToken
            user {
                id
                name
                phone
                email
            }
        }
    }
`;

const REGISTER_MUTATION = /* GraphQL */ `
    mutation Register($name: String!, $phone: String!, $password: String!) {
        register(input: { name: $name, phone: $phone, password: $password }) {
            accessToken
            refreshToken
            user {
                id
                name
                phone
                email
            }
        }
    }
`;

const REFRESH_TOKEN_MUTATION = /* GraphQL */ `
    mutation RefreshToken($refreshToken: String!) {
        refreshToken(token: $refreshToken) {
            accessToken
            refreshToken
        }
    }
`;

const ME_QUERY = /* GraphQL */ `
    query Me {
        me {
            id
            name
            phone
            email
        }
    }
`;

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export async function loginApi(input: LoginInput, lang?: string): Promise<AuthPayload> {
    const data = await gqlRequest<{ login: AuthPayload }>(LOGIN_MUTATION, { ...input }, { lang });
    return data.login;
}

export async function registerApi(input: RegisterInput, lang?: string): Promise<AuthPayload> {
    const data = await gqlRequest<{ register: AuthPayload }>(REGISTER_MUTATION, { ...input }, { lang });
    return data.register;
}

export async function refreshTokenApi(
    refreshToken: string,
    lang?: string,
): Promise<Pick<AuthPayload, 'accessToken' | 'refreshToken'>> {
    const data = await gqlRequest<{
        refreshToken: Pick<AuthPayload, 'accessToken' | 'refreshToken'>;
    }>(REFRESH_TOKEN_MUTATION, { refreshToken }, { lang });
    return data.refreshToken;
}

export async function getMeApi(token: string, lang?: string): Promise<AuthPayload['user']> {
    const data = await gqlRequest<{ me: AuthPayload['user'] }>(ME_QUERY, undefined, { token, lang });
    return data.me;
}
