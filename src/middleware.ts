import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default async function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') || '';
  const domain = hostname.split(':')[0];
  const { searchParams } = new URL(req.url);
  
  console.log(`Domain: ${domain}`);
  console.log(`URL: ${req.url}`);
  console.log(`Query params: ${searchParams.toString()}`);

  if (domain === process.env.APP_HOSTNAME) {
    console.log(`Passing through to the application`);
    return NextResponse.next();
  } else {
    const newUrl = new URL(`/${domain}`, req.url);
    // Preserve all query parameters
    searchParams.forEach((value, key) => {
      newUrl.searchParams.set(key, value);
    });

    console.log(`Rewriting to ${newUrl.toString()}`);
    return NextResponse.rewrite(newUrl);
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|soniic.ico).*)',
  ],
}