import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "script-src 'self' 'report-sample' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://maps.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://maps.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https:",
    "connect-src 'self' http://localhost:3001 https://api.stripe.com https://maps.googleapis.com https://api-bakong.nbc.gov.kh",
    "frame-src 'self' https://js.stripe.com https://maps.google.com",
    "worker-src 'self' blob: https://maps.googleapis.com",
  ].join('; ');

  const response = NextResponse.next();

  response.headers.set(
    'Content-Security-Policy-Report-Only',
    csp,
  );

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
