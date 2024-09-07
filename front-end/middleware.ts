import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/env';

const corsOptions: {
    allowedMethods: string[];
    allowedOrigins: string[];
    allowedHeaders: string[];
    exposedHeaders: string[];
    maxAge?: number;
    credentials: boolean;
} = {
    allowedMethods: (env.ALLOWED_METHODS).split(","),
    allowedOrigins: (env.ALLOWED_ORIGIN).split(","),
    allowedHeaders: (env.ALLOWED_HEADERS).split(","),
    exposedHeaders: (env.EXPOSED_HEADERS).split(","),
    maxAge: env.MAX_AGE ? parseInt(env.MAX_AGE) : undefined,
    credentials: env.CREDENTIALS === "true",
};

export function middleware(request: NextRequest) {
    const response = NextResponse.next();
    const origin = request.headers.get('origin') ?? '';
    if (corsOptions.allowedOrigins.includes('*') || corsOptions.allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
    }

    response.headers.set("Access-Control-Allow-Credentials", corsOptions.credentials.toString());
    response.headers.set("Access-Control-Allow-Methods", corsOptions.allowedMethods.join(","));
    response.headers.set("Access-Control-Allow-Headers", corsOptions.allowedHeaders.join(","));
    response.headers.set("Access-Control-Expose-Headers", corsOptions.exposedHeaders.join(","));
    response.headers.set("Access-Control-Max-Age", corsOptions.maxAge?.toString() ?? "");

    const requestHeaders = new Headers(request.headers);

    requestHeaders.set('x-invoke-path', request.nextUrl.pathname);

    return response;
}

// Config for path matching
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
        '/api/:path*',
    ],
};
