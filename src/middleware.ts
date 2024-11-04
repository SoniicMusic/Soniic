import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default async function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') || ''
  const domain = hostname.split(':')[0];
  console.log(`Domain: ${domain}`);
  if (domain != process.env.APP_HOSTNAME) {
    // Rewrite to `[domain]` route using the domain as the parameter
    return NextResponse.rewrite(new URL(`/${domain}`, req.url));
  }
  else {
  // Proceed with the request if no matching client is found
  return NextResponse.next();
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