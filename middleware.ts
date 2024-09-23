import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { NextFetchEvent } from 'next/server';

// Custom error handling middleware
async function errorHandlingMiddleware(req: NextRequest, res: NextResponse, next: () => Promise<void>) {
    try {
        await next();
    } catch (error) {
        console.error("Middleware error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

// Auth middleware
const auth = clerkMiddleware({
    publicRoutes: ["/", "/api/trpc/(.*)"]
} as any);

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
    let res: NextResponse | undefined;
    try {
        await errorHandlingMiddleware(req, new NextResponse(), () => auth(req, event));
    } catch (error) {
        console.error("Middleware error:", error);
        res = new NextResponse("Internal Server Error", { status: 500 });
    }
    return res || new NextResponse(); // Ensure a response is always returned
}

export const config = {
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};