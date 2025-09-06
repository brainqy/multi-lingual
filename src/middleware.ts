
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const pathname = url.pathname;

  const isApiOrInternal = pathname.startsWith('/api/') || pathname.startsWith('/_next/') || /\.(png|ico|svg|jpg|jpeg|css|js)$/.test(pathname);
  if (isApiOrInternal) {
    return NextResponse.next();
  }

  // Handle localhost and production domains by extracting the first part as the potential subdomain.
  // e.g., 'brainqy.localhost:9002' -> 'brainqy', 'guruji.bhashasetu.com' -> 'guruji'
  const domainParts = hostname.split('.');
  const potentialSubdomain = domainParts.length > 2 || hostname.includes('localhost') ? domainParts[0] : null;

  const response = NextResponse.next();
  let tenantId = 'platform';

  if (potentialSubdomain && potentialSubdomain !== 'platform') {
      try {
        // First, check if the subdomain matches a custom 'tenantDomain'.
        const tenantByDomain = await db.tenant.findUnique({
            where: { domain: potentialSubdomain },
        });

        if (tenantByDomain) {
            // If a match is found, use its actual ID as the tenantId.
            tenantId = tenantByDomain.id;
        } else {
            // Fallback: check if the subdomain matches a tenant's ID directly.
            const tenantById = await db.tenant.findUnique({
                where: { id: potentialSubdomain },
            });
            if (tenantById) {
                tenantId = tenantById.id;
            } else {
              // If neither matches, it might be an invalid subdomain, but we pass it along.
              // The application logic will handle whether it's a valid tenant.
              tenantId = potentialSubdomain;
            }
        }
      } catch (error) {
        console.error('[Middleware] Database error:', error);
        // Fallback to platform on db error to avoid crashing
        tenantId = 'platform';
      }
  }

  response.headers.set('X-Tenant-Id', tenantId);
  console.log(`[Middleware] Host: ${hostname}, Subdomain: ${potentialSubdomain}, Resolved Tenant ID: ${tenantId}`);

  // If the user is on a tenant subdomain but tries to access a public-only page like '/',
  // redirect them to the tenant-specific login page.
  if (potentialSubdomain && (pathname === '/' || pathname === '/landing')) {
    url.pathname = '/auth/login';
    console.log(`[Middleware] Redirecting from root of subdomain '${potentialSubdomain}' to ${url.pathname}`);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.png$).*)',
  ],
};
