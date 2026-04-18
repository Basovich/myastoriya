import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const defaultLocale = 'ua';
const locales = ['ua', 'ru'];

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

    // 2. Redirect /ua to / (clean URL for default locale)
    if (pathname === '/ua' || pathname.startsWith('/ua/')) {
        const cleanPath = pathname.replace(/^\/ua/, '') || '/';
        return NextResponse.redirect(new URL(`${cleanPath}${search}`, request.url));
    }

    // 3. Redirect /personal to /personal/profile/
    if (pathname === '/personal' || pathname === '/personal/') {
        return NextResponse.redirect(new URL('/personal/profile/', request.url));
    }

    // 4. Protect /personal/* — require access_token cookie
    if (isProtectedPath(pathname)) {
        const token = request.cookies.get('access_token')?.value;
        if (!token) {
            const redirectUrl = new URL('/', request.url);
            redirectUrl.searchParams.set('auth', '1');
            return NextResponse.redirect(redirectUrl);
        }
    }

    // 5. Internal rewrite to [lang] structure
    // Check if the URL already has a locale
    const pathnameHasLocale = locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    if (!pathnameHasLocale) {
        // Rewrite to default locale /ua/path
        return NextResponse.rewrite(
            new URL(`/ua${pathname}${search}`, request.url)
        );
    }
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
