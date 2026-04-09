import { NextRequest, NextResponse } from "next/server";

const GQL_ENDPOINT = 'https://dev-api.myastoriya.com.ua/graphql';

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const headers: Record<string, string> = {};
        
        req.headers.forEach((value, key) => {
            const lowerKey = key.toLowerCase();
            // Do not copy host, origin, referer, etc to avoid CORS/Host mismatch on backend side
            if (!['host', 'origin', 'referer', 'content-length'].includes(lowerKey)) {
                headers[key] = value;
            }
        });

        const res = await fetch(GQL_ENDPOINT, {
            method: 'POST',
            headers,
            body,
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
