import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default async function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') || ''
  const domain = hostname.split(':')[0];
  console.log(`Domain: ${domain}`);
  // console.log(`Headers: ${JSON.stringify(req.headers)}`);
  console.log(`URL: ${req.url}`);
  if (domain === process.env.APP_HOSTNAME) {
    // Pass through to the application
    console.log(`Passing through to the application`);
    return NextResponse.next();
  }
  else {
    console.log(`Rewriting to ${domain}`);
    // Rewrite to `[domain]` route using the domain as the parameter
    return NextResponse.rewrite(new URL(`/${domain}`, req.url));
}
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)'  ],
}