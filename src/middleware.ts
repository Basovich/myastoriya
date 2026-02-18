import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const defaultLocale = 'ua';
const locales = ['ua', 'ru'];

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // 1. Redirect /ua to /
    if (pathname === '/ua' || pathname.startsWith('/ua/')) {
        return NextResponse.redirect(
            new URL(
                pathname.replace(/^\/ua/, ''),
                request.url
            )
        );
    }

    // 2. Check if there is any supported locale in the pathname
    const pathnameIsMissingLocale = locales.every(
        (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    );

    if (pathnameIsMissingLocale) {
        // Rewrite to /ua (default)
        return NextResponse.rewrite(
            new URL(`/ua${pathname}${request.nextUrl.search}`, request.url)
        );
    }
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|icons|fonts|site.webmanifest).*)'],
};
