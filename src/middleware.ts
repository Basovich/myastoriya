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

    // 1. Redirect /ua to / (clean URL for default locale)
    if (pathname === '/ua' || pathname.startsWith('/ua/')) {
        const cleanPath = pathname.replace(/^\/ua/, '') || '/';
        if (pathname !== cleanPath) {
            return NextResponse.redirect(new URL(`${cleanPath}${search}`, request.url));
        }
    }

    // 2. Redirect /personal to /personal/profile/
    if (pathname === '/personal' || pathname === '/personal/') {
        return NextResponse.redirect(new URL('/personal/profile/', request.url));
    }

    // 3. Protect /personal/* — require access_token cookie
    if (isProtectedPath(pathname)) {
        const token = request.cookies.get('access_token')?.value;
        if (!token) {
            // Redirect to home; client will open AuthModal
            const redirectUrl = new URL('/', request.url);
            redirectUrl.searchParams.set('auth', '1');
            return NextResponse.redirect(redirectUrl);
        }
    }

    // 4. Check if there is any supported locale in the pathname
    const pathnameIsMissingLocale = locales.every(
        (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
    );

    if (pathnameIsMissingLocale) {
        // Rewrite to /ua (default) internally
        return NextResponse.rewrite(
            new URL(`/ua${pathname}${search}`, request.url),
        );
    }
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|icons|fonts|site.webmanifest).*)'],
};
