
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = url;

  // Skip middleware for API, internal Next.js routes, and static files.
  const isApiOrInternal = pathname.startsWith('/api/') || pathname.startsWith('/_next/') || /\.(png|ico|svg|jpg|jpeg|css|js)$/.test(pathname);
  if (isApiOrInternal) {
    return NextResponse.next();
  }

  const hostname = request.headers.get('host') || '';
  
  // Adjusted regex to better handle localhost with ports
  const localhostMatch = hostname.match(/^(.*?)\.localhost(:\d+)?$/);
  const potentialSubdomain = localhostMatch ? localhostMatch[1] : (hostname.split('.').length > 2 && hostname.split('.')[0] !== 'www') ? hostname.split('.')[0] : null;

  const response = NextResponse.next();
  const tenantId = potentialSubdomain || 'platform';
  
  // Set a header with the resolved tenant ID (or domain)
  response.headers.set('X-Tenant-Id', tenantId);

  // Redirect root path of subdomains to login
  if (potentialSubdomain && (pathname === '/' || pathname === '/landing')) {
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.png$).*)',
  ],
};
