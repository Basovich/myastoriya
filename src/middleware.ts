import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const defaultLocale = 'ua';
const locales = ['ua', 'ru'];

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const search = request.nextUrl.search;

    // 1. Redirect /ua to / (clean URL for default locale)
    if (pathname === '/ua' || pathname.startsWith('/ua/')) {
        const cleanPath = pathname.replace(/^\/ua/, '') || '/';
        // Only redirect if we are not at root already (to avoid potential internal loops)
        if (pathname !== cleanPath) {
            return NextResponse.redirect(new URL(`${cleanPath}${search}`, request.url));
        }
    }

    // 2. Check if there is any supported locale in the pathname
    const pathnameIsMissingLocale = locales.every(
        (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    );

    if (pathnameIsMissingLocale) {
        // Rewrite to /ua (default) internally
        return NextResponse.rewrite(
            new URL(`/ua${pathname}${search}`, request.url)
        );
    }
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|icons|fonts|site.webmanifest).*)'],
};
