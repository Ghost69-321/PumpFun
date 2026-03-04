import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiting per IP
// Note: In multi-instance/serverless deployments, consider using Redis for distributed rate limiting
const rateLimit = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per window
const CLEANUP_THRESHOLD = 1000; // Clean up when map exceeds this size

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim();
  const realIp = request.headers.get('x-real-ip');
  return ip || realIp || 'anonymous';
}

function cleanupExpiredEntries() {
  if (rateLimit.size <= CLEANUP_THRESHOLD) return;
  const now = Date.now();
  rateLimit.forEach((entry, key) => {
    if (now > entry.resetTime) {
      rateLimit.delete(key);
    }
  });
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(key);

  // Lazily clean up expired entries
  cleanupExpiredEntries();

  if (!entry || now > entry.resetTime) {
    rateLimit.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX_REQUESTS;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only rate-limit API routes (except health check)
  if (pathname.startsWith('/api') && pathname !== '/api/health') {
    const key = getRateLimitKey(request);

    if (isRateLimited(key)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
  }

  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (uploads, robots.txt, etc.)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|uploads/).*)',
  ],
};
