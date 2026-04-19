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
    avatar?: {
        size1x?: string;
        size2x?: string;
        size3x?: string;
    } | null;
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
                email
                birthday
                sex
                avatar {
                    size1x
                    size2x
                    size3x
                }
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
                email
                birthday
                sex
                avatar {
                    size1x
                    size2x
                    size3x
                }
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
                birthday
                sex
                avatar {
                    size1x
                    size2x
                    size3x
                }
            }
        }
    }
`;

const DELETE_USER_MUTATION = /* GraphQL */ `
    mutation DeleteUser {
        deleteUser
    }
`;

const UPDATE_GUEST_DATA_MUTATION = /* GraphQL */ `
    mutation UpdateGuestData(
        $name: String!
        $surname: String!
        $phone: String!
        $email: String
    ) {
        updateGuestData(
            name: $name
            surname: $surname
            phone: $phone
            email: $email
        ) {
            id
            name
            surname
            phone
            email
        }
    }
`;

const UPDATE_CHECKOUT_USER_DATA_MUTATION = /* GraphQL */ `
    mutation UpdateCheckoutUserData(
        $name: String!
        $surname: String!
        $phone: String!
        $email: String
    ) {
        updateCheckoutUserData(
            name: $name
            surname: $surname
            phone: $phone
            email: $email
        ) {
            id
            name
            surname
            phone
            email
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
            birthday
            sex
            avatar {
                size1x
                size2x
                size3x
            }
        }
    }
`;

const UPDATE_USER_DATA_MUTATION = /* GraphQL */ `
    mutation UpdateUserData(
        $name: String!
        $surname: String!
        $phone: String!
        $email: String
        $birthday: String
        $sex: String!
        $password: String
    ) {
        updateUserData(
            name: $name
            surname: $surname
            phone: $phone
            email: $email
            birthday: $birthday
            sex: $sex
            password: $password
        ) {
            id
            name
            surname
            phone
            email
            birthday
            sex
            avatar {
                size1x
                size2x
                size3x
            }
        }
    }
`;

const UPDATE_USER_AVATAR_MUTATION = /* GraphQL */ `
    mutation UpdateUserAvatar($avatar: Upload!) {
        updateUserAvatar(avatar: $avatar) {
            id
            avatar {
                size1x
                size2x
                size3x
            }
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

export interface UpdateUserInput {
    name: string;
    surname: string;
    phone: string;
    email?: string;
    birthday?: string;
    sex: string;
    password?: string;
}

export async function updateUserDataApi(
    input: UpdateUserInput,
    token: string,
    lang?: string,
): Promise<BackendUser> {
    const data = await gqlRequest<{ updateUserData: BackendUser }>(
        UPDATE_USER_DATA_MUTATION,
        { ...input, phone: formatPhone(input.phone) },
        { token, lang },
    );
    return data.updateUserData;
}

export async function updateUserAvatarApi(
    avatar: File,
    token: string,
    lang?: string,
): Promise<BackendUser> {
    const data = await gqlRequest<{ updateUserAvatar: BackendUser }>(
        UPDATE_USER_AVATAR_MUTATION,
        { avatar },
        { token, lang },
    );
    return data.updateUserAvatar;
}

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

export async function deleteUserApi(token: string, lang?: string): Promise<boolean> {
    const data = await gqlRequest<{ deleteUser: boolean }>(
        DELETE_USER_MUTATION,
        undefined,
        { token, lang },
    );
    return data.deleteUser;
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

export interface GuestDataInput {
    name: string;
    surname: string;
    phone: string;
    email?: string;
}

/**
 * Updates personal data for a guest session.
 * Call this on the checkout page when the guest fills in their contact info.
 */
export async function updateGuestDataApi(
    input: GuestDataInput,
    token: string,
    lang?: string,
): Promise<BackendUser> {
    const data = await gqlRequest<{ updateGuestData: BackendUser }>(
        UPDATE_GUEST_DATA_MUTATION,
        { ...input, phone: formatPhone(input.phone) },
        { token, lang },
    );
    return data.updateGuestData;
}

/**
 * Updates contact data for both guest and logged-in users on the checkout page.
 * Prefer this over `updateGuestData` when you don't want to branch on auth state.
 */
export async function updateCheckoutUserDataApi(
    input: GuestDataInput,
    token: string,
    lang?: string,
): Promise<BackendUser> {
    const data = await gqlRequest<{ updateCheckoutUserData: BackendUser }>(
        UPDATE_CHECKOUT_USER_DATA_MUTATION,
        { ...input, phone: formatPhone(input.phone) },
        { token, lang },
    );
    return data.updateCheckoutUserData;
}
