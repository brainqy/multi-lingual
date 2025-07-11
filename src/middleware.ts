
import { NextRequest, NextResponse } from 'next/server';

// This is a placeholder for multitenant routing logic.
// In a real-world scenario, this middleware would be responsible for identifying
// the tenant based on the subdomain or URL path.

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host');
  
  // --- Alternative 1: Path-Based Multitenancy (e.g., /t/tenant-id/dashboard) ---
  // This is a common and simpler alternative to subdomains.
  // The logic would extract the tenant ID from the URL path and make it available
  // to the rest of the application.
  // Example:
  // const path = request.nextUrl.pathname;
  // if (path.startsWith('/t/')) {
  //   const tenantId = path.split('/')[2];
  //   // You could add the tenantId to the request headers here
  //   // for server components to access.
  // }
  

  // --- Alternative 2: Subdomain-Based Multitenancy (e.g., tenant.example.com) ---
  // Example Logic:
  // 1. Extract the subdomain (e.g., "tenant-a" from "tenant-a.localhost:3000").
  // const subdomain = hostname?.split('.')[0];

  // 2. If a subdomain exists and is not 'www', you could rewrite the path
  //    to a tenant-specific page or add a header with the tenant ID.
  //    For example:
  //    const url = request.nextUrl.clone();
  //    url.pathname = `/t/${subdomain}${url.pathname}`;
  //    return NextResponse.rewrite(url);

  // 3. For now, we will just proceed with the request without any changes,
  //    as the app currently scopes data after login.
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  // This matcher ensures the middleware runs on all request paths
  // except for internal Next.js paths and static assets.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.png$).*)',
  ],
};
