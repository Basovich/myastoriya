import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['ua', 'ru', 'en'];

const PROTECTED_PATHS = ['/personal'];
const GQL_ENDPOINT = 'https://dev-api.myastoriya.com.ua/graphql';

interface RefreshTokenResult {
    accessToken: string;
    refreshToken: string;
}

async function refreshTokensViaApi(refreshToken: string): Promise<RefreshTokenResult | null> {
    try {
        const res = await fetch(GQL_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `mutation RefreshToken($refreshToken: String!) {
                    refreshToken(refreshToken: $refreshToken) {
                        accessToken
                        refreshToken
                    }
                }`,
                variables: { refreshToken },
            }),
            cache: 'no-store',
        });
        if (!res.ok) return null;
        const json = (await res.json()) as {
            data?: { refreshToken?: RefreshTokenResult };
            errors?: unknown[];
        };
        if (json.errors || !json.data?.refreshToken?.accessToken) {
            return null;
        }
        return json.data.refreshToken;
    } catch {
        return null;
    }
}

function applyTokensToResponse(response: NextResponse, tokens: RefreshTokenResult): void {
    const isProd = process.env.NODE_ENV === 'production';
    response.cookies.set('access_token', tokens.accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60,
    });
    response.cookies.set('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
    });
}

function clearTokensFromResponse(response: NextResponse): void {
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
}

function injectCookiesIntoRequestHeaders(
    requestHeaders: Headers,
    rawCookie: string,
    newAccessToken: string,
    newRefreshToken: string,
): void {
    const cookieMap = new Map<string, string>();
    if (rawCookie) {
        rawCookie.split(';').forEach((part) => {
            const [k, ...v] = part.trim().split('=');
            if (k) cookieMap.set(k, v.join('='));
        });
    }
    cookieMap.set('access_token', newAccessToken);
    cookieMap.set('refresh_token', newRefreshToken);
    const updatedCookie = Array.from(cookieMap.entries())
        .map(([k, v]) => `${k}=${v}`)
        .join('; ');
    requestHeaders.set('cookie', updatedCookie);
}

const KNOWN_LANG_SEGMENTS = new Set([
    'catalog',
    'category',
    'product',
    'actions',
    'blog',
    'careers',
    'checkout',
    'complex-discounts',
    'contacts',
    'delivery',
    'loyalty-program-rules',
    'menu',
    'oferta',
    'our-stores',
    'personal',
    'privacy-policy',
    'search',
    'thanks',
]);

async function checkBackendRedirect(url: string): Promise<string | null> {
    try {
        const cleanUrl = url.trim();
        const res = await fetch(GQL_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `query RedirectByUrl($url: String!) { redirectByUrl(url: $url) }`,
                variables: { url: cleanUrl },
            }),
            cache: 'no-store',
        });
        if (!res.ok) return null;
        const json = (await res.json()) as { data?: { redirectByUrl?: string | null } };
        let target = json?.data?.redirectByUrl;

        // If not found and url ends with slash, try without slash
        if (!target && cleanUrl.endsWith('/') && cleanUrl.length > 1) {
            const noSlash = cleanUrl.slice(0, -1);
            const retryRes = await fetch(GQL_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: `query RedirectByUrl($url: String!) { redirectByUrl(url: $url) }`,
                    variables: { url: noSlash },
                }),
                cache: 'no-store',
            });
            if (retryRes.ok) {
                const retryJson = (await retryRes.json()) as { data?: { redirectByUrl?: string | null } };
                target = retryJson?.data?.redirectByUrl;
            }
        }

        if (target && typeof target === 'string') {
            const cleanTarget = target.trim();
            if (
                cleanTarget &&
                cleanTarget !== cleanUrl &&
                cleanTarget.replace(/\/$/, '') !== cleanUrl.replace(/\/$/, '')
            ) {
                return cleanTarget;
            }
        }
        return null;
    } catch {
        return null;
    }
}

function isProtectedPath(pathname: string): boolean {
    const stripped = pathname.replace(/^\/(?:ua|ru|en)(?=\/|$)/, '');
    return PROTECTED_PATHS.some(
        (p) => stripped === p || stripped.startsWith(`${p}/`),
    );
}

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const search = request.nextUrl.search;

    // 1. Skip middleware for static assets and API
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('.') // All files with extensions (.ico, .png, .svg, .webmanifest, etc.)
    ) {
        return NextResponse.next();
    }

    // Create request headers to inject x-pathname
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-pathname', pathname);

    // 1.5. SEO 301 Permanent Redirect for ?page=1 to main URL without page parameter
    if (request.nextUrl.searchParams.get('page') === '1') {
        const redirectUrl = new URL(request.url);
        redirectUrl.searchParams.delete('page');
        return NextResponse.redirect(redirectUrl, 301);
    }

    // 1.6. SEO 301 Permanent Redirect for English pages (/en/*) to Ukrainian version (/ua/* or /), EXCEPT restaurant menu pages (/en/menu/*)
    if (pathname === '/en' || pathname === '/en/' || pathname.startsWith('/en/')) {
        if (!pathname.startsWith('/en/menu/') && pathname !== '/en/menu') {
            if (pathname === '/en' || pathname === '/en/') {
                return NextResponse.redirect(new URL(`/${search}`, request.url), 301);
            }
            const targetPath = pathname.replace(/^\/en/, '/ua');
            return NextResponse.redirect(new URL(`${targetPath}${search}`, request.url), 301);
        }
    }

    // 2. SEO Locale & Trailing slash handling
    // Home page for default locale (UA) MUST be / (without /ua prefix)
    if (pathname === '/ua' || pathname === '/ua/') {
        return NextResponse.redirect(new URL(`/${search}`, request.url), 301);
    }

    // Ensure trailing slash for all non-root paths (301 Permanent Redirect for SEO)
    if (pathname !== '/' && !pathname.endsWith('/')) {
        return NextResponse.redirect(
            new URL(`${pathname}/${search}`, request.url),
            301
        );
    }

    // 2.7. Specific legacy route patterns that should check backend redirects
    const isLegacyPattern =
        /^(?:\/(?:ua|ru))?\/menu\/?$/.test(pathname) ||
        pathname.includes('/our-stores/shop-') ||
        /-\/?$/.test(pathname);

    if (isLegacyPattern) {
        const redirectTarget = await checkBackendRedirect(pathname);
        if (redirectTarget) {
            const targetUrl = new URL(redirectTarget, request.url);
            if (search && !targetUrl.search) {
                targetUrl.search = search;
            }
            return NextResponse.redirect(targetUrl, 301);
        }
    }

    // 3. SEO 301 Permanent Redirect for legacy /catalog/:slug category paths to /category/:slug/
    const catalogMatch = pathname.match(/^(?:\/(ua|ru))?\/catalog\/(.+)$/);
    if (catalogMatch) {
        // Check backend redirect for legacy catalog path first before fallback rewrite
        const redirectTarget = await checkBackendRedirect(pathname);
        if (redirectTarget) {
            const targetUrl = new URL(redirectTarget, request.url);
            if (search && !targetUrl.search) {
                targetUrl.search = search;
            }
            return NextResponse.redirect(targetUrl, 301);
        }

        const langPrefix = catalogMatch[1] || 'ua';
        const subPath = catalogMatch[2];
        const targetPath = `/${langPrefix}/category/${subPath}`;
        const normalizedTarget = targetPath.endsWith('/') ? targetPath : `${targetPath}/`;
        return NextResponse.redirect(new URL(`${normalizedTarget}${search}`, request.url), 301);
    }

    // If path does not start with /ua/ or /ru/ (and is not root /)
    const hasLocalePrefix = locales.some(locale => pathname.startsWith(`/${locale}/`));
    if (!hasLocalePrefix && pathname !== '/') {
        // Check if the backend has a 301 redirect for this exact URL (e.g. legacy Russian or non-prefixed paths)
        const redirectTarget = await checkBackendRedirect(pathname);
        if (redirectTarget) {
            const targetUrl = new URL(redirectTarget, request.url);
            if (search && !targetUrl.search) {
                targetUrl.search = search;
            }
            return NextResponse.redirect(targetUrl, 301);
        }

        // Default to Ukrainian locale /ua/... per SEO specs
        return NextResponse.redirect(
            new URL(`/ua${pathname}${search}`, request.url),
            301
        );
    }

    // Check legacy localized paths (e.g. /ua/syraya-produktsiya/..., /ru/gotovaya-produktsiya/...)
    // If the top-level segment is NOT one of our application's known routes, check backend for a 301 redirect
    const localizedMatch = pathname.match(/^\/(?:ua|ru|en)\/([^/]+)/);
    if (localizedMatch) {
        const firstSegment = localizedMatch[1];
        if (!KNOWN_LANG_SEGMENTS.has(firstSegment)) {
            const redirectTarget = await checkBackendRedirect(pathname);
            if (redirectTarget) {
                const targetUrl = new URL(redirectTarget, request.url);
                if (search && !targetUrl.search) {
                    targetUrl.search = search;
                }
                return NextResponse.redirect(targetUrl, 301);
            }
        }
    }

    // 4. Redirect /personal/ to /personal/profile/
    const strippedPersonal = pathname.replace(/^\/(?:ua|ru|en)(?=\/|$)/, '');
    if (strippedPersonal === '/personal' || strippedPersonal === '/personal/') {
        const langPrefix = pathname.match(/^\/(ua|ru|en)/)?.[1];
        const target = langPrefix ? `/${langPrefix}/personal/profile/` : '/personal/profile/';
        return NextResponse.redirect(new URL(target, request.url), 301);
    }

    // 4. Protect /personal/* — require valid access_token (or refreshed session)
    let refreshedTokens: RefreshTokenResult | null = null;
    if (isProtectedPath(pathname)) {
        let accessToken = request.cookies.get('access_token')?.value;
        const refreshToken = request.cookies.get('refresh_token')?.value;

        // If access_token is missing, try to refresh for protected path
        if (!accessToken && refreshToken) {
            refreshedTokens = await refreshTokensViaApi(refreshToken);
            if (refreshedTokens) {
                accessToken = refreshedTokens.accessToken;
                injectCookiesIntoRequestHeaders(
                    requestHeaders,
                    request.headers.get('cookie') || '',
                    refreshedTokens.accessToken,
                    refreshedTokens.refreshToken,
                );
            }
        }

        if (!accessToken) {
            const redirectUrl = new URL('/', request.url);
            const redirectRes = NextResponse.redirect(redirectUrl);
            clearTokensFromResponse(redirectRes);
            return redirectRes;
        }
    }

    // 5. Internal rewrite for default locale (UA) on root '/' -> rewrite to /ua/
    let finalResponse: NextResponse;
    if (pathname === '/') {
        finalResponse = NextResponse.rewrite(
            new URL(`/ua/${search}`, request.url),
            { request: { headers: requestHeaders } }
        );
    } else {
        // 6. Internal rewrite to [lang] structure
        const pathnameHasLocale = locales.some(
            (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
        );

        if (!pathnameHasLocale) {
            // No locale prefix → rewrite to default locale /ua/path
            finalResponse = NextResponse.rewrite(
                new URL(`/ua${pathname}${search}`, request.url),
                { request: { headers: requestHeaders } }
            );
        } else {
            // Has a locale prefix (e.g. /ru/...) → pass through with updated headers
            finalResponse = NextResponse.next({
                request: { headers: requestHeaders },
            });
        }
    }

    if (refreshedTokens) {
        applyTokensToResponse(finalResponse, refreshedTokens);
    }

    return finalResponse;
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
