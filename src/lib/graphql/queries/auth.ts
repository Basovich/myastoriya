import { gqlRequest } from '../client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BackendUser {
    id: string;
    name: string;
    surname: string;
    phone: string;
    email?: string;
    birthday?: string;
    sex?: string;
}

export interface AuthFields {
    tokenType: string;
    expiresIn: number;
    accessToken: string;
    refreshToken: string;
}

export interface LoggedInUser extends AuthFields {
    user: BackendUser;
}

export interface SMSTokenResponse {
    token: string;
    /** Only present in developer/staging mode */
    code?: string;
}

export interface ActionTokenResponse {
    token: string;
}

// Legacy exports kept for backwards compat
export interface LoginInput {
    phone: string;
    password: string;
}

export interface RegisterInput {
    name: string;
    surname: string;
    phone: string;
    password: string;
    actionToken: string;
    deviceId?: string;
    email?: string;
}

export interface AuthPayload {
    accessToken: string;
    refreshToken: string;
    user: BackendUser;
}

// ---------------------------------------------------------------------------
// Mutations / Queries
// ---------------------------------------------------------------------------

const SEND_SMS_MUTATION = /* GraphQL */ `
    mutation SendSMS($phone: String!) {
        sendSMS(phone: $phone) {
            token
            code
        }
    }
`;

const SMS_VERIFY_MUTATION = /* GraphQL */ `
    mutation SmsVerify($token: String!, $code: Int!) {
        smsVerify(token: $token, code: $code) {
            token
        }
    }
`;

const LOGIN_MUTATION = /* GraphQL */ `
    mutation Login($phone: String!, $password: String!) {
        login(phone: $phone, password: $password) {
            tokenType
            expiresIn
            accessToken
            refreshToken
            user {
                id
                name
                surname
                phone
            }
        }
    }
`;

const REGISTRATION_MUTATION = /* GraphQL */ `
    mutation Registration(
        $name: String!
        $surname: String!
        $phone: String!
        $password: String!
        $actionToken: String!
        $deviceId: String
        $email: String
    ) {
        registration(
            name: $name
            surname: $surname
            phone: $phone
            password: $password
            actionToken: $actionToken
            deviceId: $deviceId
            email: $email
        ) {
            tokenType
            expiresIn
            accessToken
            refreshToken
            user {
                id
                name
                surname
                phone
            }
        }
    }
`;

const RESET_PASSWORD_MUTATION = /* GraphQL */ `
    mutation ResetPassword($phone: String!, $password: String!, $actionToken: String!) {
        resetPassword(phone: $phone, password: $password, actionToken: $actionToken)
    }
`;

const REFRESH_TOKEN_MUTATION = /* GraphQL */ `
    mutation RefreshToken($refreshToken: String!) {
        refreshToken(refreshToken: $refreshToken) {
            tokenType
            expiresIn
            accessToken
            refreshToken
        }
    }
`;

const AUTH_AS_GUEST_MUTATION = /* GraphQL */ `
    mutation AuthAsGuest($deviceId: String!) {
        authAsGuest(deviceId: $deviceId) {
            tokenType
            expiresIn
            accessToken
            refreshToken
        }
    }
`;

const LOGOUT_MUTATION = /* GraphQL */ `
    mutation Logout {
        logout
    }
`;

const SOCIAL_AUTH_MUTATION = /* GraphQL */ `
    mutation SocialAuth($provider: String!, $code: String!, $deviceId: String) {
        socialAuth(provider: $provider, code: $code, deviceId: $deviceId) {
            tokenType
            expiresIn
            accessToken
            refreshToken
            user {
                id
                name
                surname
                phone
                email
            }
        }
    }
`;

const CHECK_USER_PHONE_QUERY = /* GraphQL */ `
    query CheckUserPhone($phone: String) {
        checkUserPhone(phone: $phone)
    }
`;

const ME_QUERY = /* GraphQL */ `
    query Me {
        user {
            id
            name
            surname
            phone
            email
        }
    }
`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    return digits ? `+${digits}` : phone;
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export async function sendSmsApi(
    phone: string,
    lang?: string,
): Promise<SMSTokenResponse> {
    const formattedPhone = formatPhone(phone);
    const data = await gqlRequest<{ sendSMS: SMSTokenResponse }>(
        SEND_SMS_MUTATION,
        { phone: formattedPhone },
        { lang },
    );
    return data.sendSMS;
}

export async function smsVerifyApi(
    token: string,
    code: string | number,
    lang?: string,
): Promise<ActionTokenResponse> {
    const numericCode = typeof code === 'string' ? parseInt(code, 10) : code;
    const data = await gqlRequest<{ smsVerify: ActionTokenResponse }>(
        SMS_VERIFY_MUTATION,
        { token, code: numericCode },
        { lang },
    );
    return data.smsVerify;
}

export async function loginApi(
    input: LoginInput,
    lang?: string,
): Promise<LoggedInUser> {
    const data = await gqlRequest<{ login: LoggedInUser }>(
        LOGIN_MUTATION,
        { phone: formatPhone(input.phone), password: input.password },
        { lang },
    );
    return data.login;
}

export async function registrationApi(
    input: RegisterInput,
    lang?: string,
): Promise<LoggedInUser> {
    const data = await gqlRequest<{ registration: LoggedInUser }>(
        REGISTRATION_MUTATION,
        { ...input, phone: formatPhone(input.phone) },
        { lang },
    );
    return data.registration;
}

export async function resetPasswordApi(
    phone: string,
    password: string,
    actionToken: string,
    lang?: string,
): Promise<boolean> {
    const data = await gqlRequest<{ resetPassword: boolean }>(
        RESET_PASSWORD_MUTATION,
        { phone: formatPhone(phone), password, actionToken },
        { lang },
    );
    return data.resetPassword;
}

export async function refreshTokenApi(
    refreshToken: string,
    lang?: string,
): Promise<AuthFields> {
    const data = await gqlRequest<{ refreshToken: AuthFields }>(
        REFRESH_TOKEN_MUTATION,
        { refreshToken },
        { lang },
    );
    return data.refreshToken;
}

export async function authAsGuestApi(
    deviceId: string,
    lang?: string,
): Promise<AuthFields> {
    const data = await gqlRequest<{ authAsGuest: AuthFields }>(
        AUTH_AS_GUEST_MUTATION,
        { deviceId },
        { lang },
    );
    return data.authAsGuest;
}

export async function logoutApi(token: string, lang?: string): Promise<boolean> {
    const data = await gqlRequest<{ logout: boolean }>(
        LOGOUT_MUTATION,
        undefined,
        { token, lang },
    );
    return data.logout;
}
export async function checkUserPhoneApi(
    phone: string,
    lang?: string,
): Promise<boolean> {
    const data = await gqlRequest<{ checkUserPhone: boolean }>(
        CHECK_USER_PHONE_QUERY,
        { phone: formatPhone(phone) },
        { lang },
    );
    return data.checkUserPhone;
}

export async function socialAuthApi(
    provider: string,
    code: string,
    deviceId?: string,
    lang?: string,
    token?: string,
): Promise<LoggedInUser> {
    const data = await gqlRequest<{ socialAuth: LoggedInUser }>(
        SOCIAL_AUTH_MUTATION,
        { provider, code, deviceId },
        { lang, token },
    );
    return data.socialAuth;
}

export async function getMeApi(
    token: string,
    lang?: string,
): Promise<BackendUser> {
    const data = await gqlRequest<{ user: BackendUser }>(
        ME_QUERY,
        undefined,
        { token, lang },
    );
    return data.user;
}
