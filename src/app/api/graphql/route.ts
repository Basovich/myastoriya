import { NextRequest, NextResponse } from "next/server";

const GQL_ENDPOINT = 'https://dev-api.myastoriya.com.ua/graphql';

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const headers: Record<string, string> = {};

        req.headers.forEach((value, key) => {
            const lowerKey = key.toLowerCase();
            if (!['host', 'content-length', 'cookie', 'authorization'].includes(lowerKey)) {
                headers[lowerKey] = value;
            }
        });

        // Re-add cookie and authorization headers explicitly to ensure they are present and unique
        const cookie = req.headers.get('cookie') || req.cookies.getAll().map(c => `${c.name}=${c.value}`).join('; ');
        if (cookie) {
            headers['cookie'] = cookie;
        }

        const token = req.cookies.get('access_token')?.value || req.headers.get('authorization')?.replace('Bearer ', '');
        if (token) {
            headers['authorization'] = `Bearer ${token}`;
        }

        // Ensure origin and referer are present (sometimes stripped by intermediate layers)
        if (!headers['origin']) {
            headers['origin'] = req.nextUrl.origin;
        }
        if (!headers['referer']) {
            headers['referer'] = req.nextUrl.href;
        }

        // Forward client IP
        const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip');
        if (clientIp) {
            headers['x-forwarded-for'] = clientIp;
            headers['x-real-ip'] = clientIp;
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
