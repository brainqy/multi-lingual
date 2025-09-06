
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function middleware(request: NextRequest) {
  console.log('L5', { url: request.nextUrl.href });
  const url = request.nextUrl.clone();
  
  console.log('L6', { headers: Object.fromEntries(request.headers.entries()) });
  const hostname = request.headers.get('host') || '';
  
  console.log('L7', { pathname: url.pathname });
  const pathname = url.pathname;

  console.log('L9');
  const isApiOrInternal = pathname.startsWith('/api/') || pathname.startsWith('/_next/') || /\.(png|ico|svg|jpg|jpeg|css|js)$/.test(pathname);
  
  console.log('L10', { isApiOrInternal });
  if (isApiOrInternal) {
    console.log('L11 - Bypassing middleware for API/internal request');
    return NextResponse.next();
  }

  console.log('L16', { hostname });
  const domainParts = hostname.split('.');
  
  console.log('L17', { domainParts });
  const potentialSubdomain = (domainParts.length > 2 || hostname.includes('localhost')) && domainParts[0] !== 'www' ? domainParts[0] : null;

  console.log('L19', { potentialSubdomain });
  const response = NextResponse.next();
  
  console.log('L20');
  let tenantId = 'platform';

  console.log('L22', { potentialSubdomain });
  if (potentialSubdomain && potentialSubdomain !== 'platform') {
      console.log('L23 - Entering tenant lookup block');
      try {
        console.log('L26 - Querying for tenant by domain:', potentialSubdomain);
        const tenantByDomain = await db.tenant.findFirst({
            where: { domain: potentialSubdomain },
        });

        console.log('L30', { tenantByDomain });
        if (tenantByDomain) {
            console.log('L32 - Found tenant by domain. Setting tenantId.');
            tenantId = tenantByDomain.id;
        } else {
            console.log('L35 - Tenant not found by domain, falling back to query by ID:', potentialSubdomain);
            const tenantById = await db.tenant.findUnique({
                where: { id: potentialSubdomain },
            });
            console.log('L38', { tenantById });
            if (tenantById) {
                console.log('L39 - Found tenant by ID. Setting tenantId.');
                tenantId = tenantById.id;
            } else {
              console.log('L43 - Tenant not found by domain or ID. Passing potentialSubdomain as tenantId.');
              tenantId = potentialSubdomain;
            }
        }
      } catch (error) {
        console.log('L47 - Database error during tenant lookup.', { error });
        console.log('L49 - Falling back to platform tenantId due to error.');
        tenantId = 'platform';
      }
  }

  console.log('L53 - Setting X-Tenant-Id header:', tenantId);
  response.headers.set('X-Tenant-Id', tenantId);
  
  console.log('L54', { finalMiddlewareState: { hostname, potentialSubdomain, resolvedTenantId: tenantId } });

  console.log('L58', { potentialSubdomain, pathname });
  if (potentialSubdomain && (pathname === '/' || pathname === '/landing')) {
    console.log('L59 - Redirecting from root of subdomain to /auth/login');
    url.pathname = '/auth/login';
    console.log('L60', { redirectTo: url.href });
    const redirectResponse = NextResponse.redirect(url);
    console.log('L61 - Returning redirect response.');
    return redirectResponse;
  }

  console.log('L64 - Proceeding with original request.');
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.png$).*)',
  ],
};
