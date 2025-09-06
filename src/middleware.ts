import { NextRequest, NextResponse } from 'next/server';
// IMPORTANT: Import the Edge-compatible client
import { db } from '@/lib/db.edge';

export async function middleware(request: NextRequest) {
  console.log('L5', { url: request.url });
  console.log('L6', { headers: Object.fromEntries(request.headers) });
  const url = request.nextUrl.clone();
  console.log('L7', { pathname: url.pathname });

  const { pathname } = url;
  console.log('L9');

  const isApiOrInternal = pathname.startsWith('/api/') || pathname.startsWith('/_next/') || /\.(png|ico|svg|jpg|jpeg|css|js)$/.test(pathname);
  console.log('L10', { isApiOrInternal });
  
  if (isApiOrInternal) {
    console.log('L12 - Skipping middleware for API/internal request.');
    return NextResponse.next();
  }

  const hostname = request.headers.get('host') || '';
  console.log('L16', { hostname });
  const domainParts = hostname.split('.');
  console.log('L17', { domainParts });

  const potentialSubdomain = (domainParts.length > 1 && domainParts[0] !== 'www' && domainParts[0] !== 'localhost') ? domainParts[0] : null;
  console.log('L19', { potentialSubdomain });
  const response = NextResponse.next();
  console.log('L20');
  
  let tenantId = 'platform';
  console.log('L22', { potentialSubdomain });

  if (potentialSubdomain && potentialSubdomain !== 'platform') {
      console.log('L23 - Entering tenant lookup block');
      try {
        console.log('L26 - Querying for tenant by domain:', potentialSubdomain);
        // Use the Edge-compatible client for this query.
        const tenantByDomain = await db.tenant.findFirst({
            where: { domain: potentialSubdomain },
        });

        if (tenantByDomain) {
            console.log('L32 - Found tenant by domain:', tenantByDomain.id);
            tenantId = tenantByDomain.id;
        } else {
            console.log('L35 - Tenant not found by domain, checking by ID:', potentialSubdomain);
            // Fallback to check if the subdomain is a tenant ID
            const tenantById = await db.tenant.findUnique({
                where: { id: potentialSubdomain },
            });
            if (tenantById) {
                console.log('L41 - Found tenant by ID:', tenantById.id);
                tenantId = tenantById.id;
            } else {
              console.log('L44 - Tenant not found by domain or ID. Passing subdomain as potential new tenantId.');
              tenantId = potentialSubdomain;
            }
        }
      } catch (error) {
        console.log('L47 - Database error during tenant lookup.', { error });
        // Fallback to 'platform' on any database error to avoid crashing.
        tenantId = 'platform';
        console.log('L49 - Falling back to platform tenantId due to error.');
      }
  }

  console.log('L53 - Setting X-Tenant-Id header:', tenantId);
  response.headers.set('X-Tenant-Id', tenantId);
  console.log('L54', { finalMiddlewareState: { hostname, potentialSubdomain, resolvedTenantId: tenantId } });

  if (potentialSubdomain && (pathname === '/' || pathname === '/landing')) {
    console.log('L58', { potentialSubdomain, pathname });
    url.pathname = '/auth/login';
    console.log('L60 - Redirecting to login for subdomain root.');
    return NextResponse.redirect(url);
  }

  console.log('L64 - Proceeding with original request.');
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.png$).*)',
  ],
};
