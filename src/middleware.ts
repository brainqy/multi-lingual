import { NextRequest, NextResponse } from 'next/server';
// IMPORTANT: Import the Edge-compatible client
import { db } from '@/lib/db.edge';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  const hostname = request.headers.get('host') || '';
  const pathname = url.pathname;

  const isApiOrInternal = pathname.startsWith('/api/') || pathname.startsWith('/_next/') || /\.(png|ico|svg|jpg|jpeg|css|js)$/.test(pathname);
  
  if (isApiOrInternal) {
    return NextResponse.next();
  }

  const domainParts = hostname.split('.');
  const potentialSubdomain = (domainParts.length > 2 || hostname.includes('localhost')) && domainParts[0] !== 'www' ? domainParts[0] : null;

  const response = NextResponse.next();
  
  let tenantId = 'platform';

  if (potentialSubdomain && potentialSubdomain !== 'platform') {
      try {
        // Use the Edge-compatible client for this query.
        const tenantByDomain = await db.tenant.findFirst({
            where: { domain: potentialSubdomain },
        });

        if (tenantByDomain) {
            tenantId = tenantByDomain.id;
        } else {
            // Fallback to check if the subdomain is a tenant ID
            const tenantById = await db.tenant.findUnique({
                where: { id: potentialSubdomain },
            });
            if (tenantById) {
                tenantId = tenantById.id;
            } else {
              // If not found, it might be a new tenant being created, or an invalid one.
              // We pass the potential subdomain as the tenantId for the backend to handle.
              tenantId = potentialSubdomain;
            }
        }
      } catch (error) {
        console.error('[Middleware] Database error during tenant lookup.', { error });
        // Fallback to 'platform' on any database error to avoid crashing.
        tenantId = 'platform';
      }
  }

  response.headers.set('X-Tenant-Id', tenantId);
  
  console.log('[Middleware] Final State:', { hostname, potentialSubdomain, resolvedTenantId: tenantId, pathname });

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
