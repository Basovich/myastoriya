import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['ua', 'ru', 'en'];

const PROTECTED_PATHS = ['/personal'];

function isProtectedPath(pathname: string): boolean {
    return PROTECTED_PATHS.some(
        (p) => pathname === p || pathname.startsWith(`${p}/`),
    );
}

export function middleware(request: NextRequest) {
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

    // If path does not start with /ua/ or /ru/ (and is not root /), redirect default locale to /ua/... per SEO specs
    const hasLocalePrefix = locales.some(locale => pathname.startsWith(`/${locale}/`));
    if (!hasLocalePrefix && pathname !== '/') {
        return NextResponse.redirect(
            new URL(`/ua${pathname}${search}`, request.url),
            301
        );
    }

    // 3. Redirect /personal/ to /personal/profile/
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

    // Has a non-default locale (e.g. /ru/...) → explicit rewrite so Next.js
    // resolves it through the [lang] dynamic segment, not a literal folder.
    return NextResponse.rewrite(
        new URL(`${pathname}${search}`, request.url),
        { request: { headers: requestHeaders } }
    );
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
