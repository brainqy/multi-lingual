
import { NextRequest, NextResponse } from 'next/server';

// This middleware identifies the tenant based on the subdomain
// and passes that information via a request header.
// It does NOT rewrite the URL path, avoiding "Page not found" errors.

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // For local development, this extracts the subdomain from e.g., `brainqy.localhost:9002`.
  // In production, you would adjust this for your actual domain, e.g., 'jobmatch.ai'.
  const subdomain = hostname.split('.')[0];
  
  // Define your known tenants. In a real app, this would come from a database.
  const knownTenants = ['brainqy', 'cpp']; 

  // Create a new response object so we can modify its headers.
  const response = NextResponse.next();

  if (knownTenants.includes(subdomain)) {
    // Pass the tenant ID via a request header.
    // Your application logic can now read this header to scope data.
    console.log(`Request for tenant: ${subdomain}. Setting X-Tenant-Id header.`);
    response.headers.set('X-Tenant-Id', subdomain);
  }

  return response;
}

// See "Matching Paths" below to learn more
export const config = {
  // This matcher ensures the middleware runs on all request paths
  // except for internal Next.js paths and static assets.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.png$).*)',
  ],
};
