import { NextRequest, NextResponse } from "next/server";

const GQL_ENDPOINT = 'https://dev-api.myastoriya.com.ua/graphql';

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const headers: Record<string, string> = {};

        req.headers.forEach((value, key) => {
            const lowerKey = key.toLowerCase();
            // Forward everything except host and content-length which should be set by the new request
            if (!['host', 'content-length'].includes(lowerKey)) {
                headers[key] = value;
            }
        });

        // Ensure critical browser headers are present (Next.js sometimes strips them)
        if (!headers['origin']) {
            headers['origin'] = req.nextUrl.origin;
        }
        if (!headers['referer']) {
            headers['referer'] = req.nextUrl.href;
        }
        if (!headers['cookie']) {
            const allCookies = req.cookies.getAll().map(c => `${c.name}=${c.value}`).join('; ');
            if (allCookies) {
                headers['cookie'] = allCookies;
            }
        }

        // Forward client IP
        const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip');
        if (clientIp) {
            headers['x-forwarded-for'] = clientIp;
            headers['x-real-ip'] = clientIp;
        }

        // Add Authorization header from cookie if not already present
        if (!headers['authorization']) {
            const token = req.cookies.get('access_token')?.value;
            if (token) {
                headers['authorization'] = `Bearer ${token}`;
            }
        }

        const res = await fetch(GQL_ENDPOINT, {
            method: 'POST',
            headers,
            body,
            cache: 'no-store',
        });

        const data = await res.text();
        
        const responseHeaders = new Headers();
        res.headers.forEach((value, key) => {
            const lowerKey = key.toLowerCase();
            // the backend might send content-encoding: gzip, but Next.js NextResponse handles encoding.
            // safely copy safe headers.
            if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(lowerKey)) {
                responseHeaders.set(key, value);
            }
        });

        return new NextResponse(data, {
            status: res.status,
            headers: responseHeaders,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Internal Server Error";
        return NextResponse.json({ errors: [{ message }] }, { status: 500 });
    }
}
