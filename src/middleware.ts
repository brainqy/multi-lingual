
import { NextRequest, NextResponse } from 'next/server';

// This is a placeholder for multitenant routing logic.
// In a real-world scenario, this middleware would be responsible for identifying
// the tenant based on the subdomain or URL path.

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // For local development, we might use something like `brainqy.localhost:9002`.
  // This logic extracts the subdomain part.
  // It assumes your main app domain is `localhost` locally. For production, you'd change 'localhost' to your actual domain (e.g., 'jobmatch.ai').
  const subdomain = hostname.split('.')[0];
  
  // You can define which subdomains are considered tenants.
  const knownTenants = ['brainqy', 'cpp']; 
  
  if (knownTenants.includes(subdomain)) {
    // Rewrite the path to include the tenant ID, so pages can access it.
    // For example, `brainqy.localhost:9002/dashboard` becomes a request for `/t/brainqy/dashboard`.
    // This allows you to use a file structure like `src/app/(app)/t/[tenantId]/...`
    console.log(`Rewriting for tenant: ${subdomain}`);
    url.pathname = `/t/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // If it's not a known tenant subdomain, continue to the requested page.
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
