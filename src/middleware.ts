
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const pathname = url.pathname;

  const isApiOrInternal = pathname.startsWith('/api/') || pathname.startsWith('/_next/') || /\.(png|ico|svg|jpg|jpeg|css|js)$/.test(pathname);
  if (isApiOrInternal) {
    return NextResponse.next();
  }

  // Handle localhost and production domains
  const domainParts = hostname.replace('localhost', 'app.localhost').split('.'); // Treat localhost like myapp.localhost
  const subdomain = domainParts.length > 2 ? domainParts[0] : null;
  
  // Create a new response object so we can modify its headers.
  const response = NextResponse.next();

  // The tenantId 'platform' is used for the main domain without a subdomain.
  const tenantId = subdomain || 'platform';
  response.headers.set('X-Tenant-Id', tenantId);
  console.log(`[Middleware] Host: ${hostname}, Subdomain: ${subdomain}, Tenant ID: ${tenantId}`);
  
  // If the user is on a tenant subdomain but tries to access the root public page,
  // redirect them to the tenant-specific login page.
  if (subdomain && pathname === '/') {
    url.pathname = '/auth/login';
    console.log(`[Middleware] Redirecting from root of subdomain '${subdomain}' to ${url.pathname}`);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.png$).*)',
  ],
};
