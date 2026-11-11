import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['ua', 'ru', 'en'];

const PROTECTED_PATHS = ['/personal'];
const GQL_ENDPOINT = 'https://dev-api.myastoriya.com.ua/graphql';

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
    return PROTECTED_PATHS.some(
        (p) => pathname === p || pathname.startsWith(`${p}/`),
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

    // 3. SEO 301 Permanent Redirect for legacy /catalog/:slug category paths to /category/:slug/
    const catalogMatch = pathname.match(/^(?:\/(ua|ru))?\/catalog\/(.+)$/);
    if (catalogMatch) {
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
    if (pathname === '/personal/') {
        return NextResponse.redirect(new URL('/personal/profile/', request.url), 301);
    }

    // 4. Protect /personal/* — require access_token cookie
    if (isProtectedPath(pathname)) {
        const token = request.cookies.get('access_token')?.value;
        if (!token) {
            const redirectUrl = new URL('/', request.url);
            return NextResponse.redirect(redirectUrl);
        }
    }

    // 5. Internal rewrite for default locale (UA) on root '/' -> rewrite to /ua/
    if (pathname === '/') {
        return NextResponse.rewrite(
            new URL(`/ua/${search}`, request.url),
            { request: { headers: requestHeaders } }
        );
    }

    // 6. Internal rewrite to [lang] structure
    const pathnameHasLocale = locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    if (!pathnameHasLocale) {
        // No locale prefix → rewrite to default locale /ua/path
        return NextResponse.rewrite(
            new URL(`/ua${pathname}${search}`, request.url),
            { request: { headers: requestHeaders } }
        );
    }

    // Has a locale prefix (e.g. /ru/...) → pass through with updated headers
    return NextResponse.next({
        request: { headers: requestHeaders },
    });
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
