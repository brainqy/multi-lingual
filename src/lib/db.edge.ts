import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function middleware(request: NextRequest) {
  console.log("L5", { url: request.url });
  console.log("L6", { headers: Object.fromEntries(request.headers.entries()) });
  const url = request.nextUrl.clone();
  console.log("L7", { pathname: url.pathname });
  const { pathname } = url;

  console.log("L9");
  // Skip middleware for API, internal Next.js routes, and static files.
  const isApiOrInternal = pathname.startsWith('/api/') || pathname.startsWith('/_next/') || /\.(png|ico|svg|jpg|jpeg|css|js)$/.test(pathname);
  console.log("L10", { isApiOrInternal });
  if (isApiOrInternal) {
    console.log("L12 - Skipping middleware for API/internal route");
    return NextResponse.next();
  }

  console.log("L16", { hostname: request.headers.get('host') });
  const hostname = request.headers.get('host') || '';
  console.log("L17", { domainParts: hostname.split('.') });
  const domainParts = hostname.split('.');
  console.log("L19", { potentialSubdomain: (domainParts.length > 1 && domainParts[0] !== 'www' && domainParts[0] !== 'localhost') ? domainParts[0] : null });
  const potentialSubdomain = (domainParts.length > 1 && domainParts[0] !== 'www' && domainParts[0] !== 'localhost') ? domainParts[0] : null;

  console.log("L20");
  const response = NextResponse.next();
  let tenantId = 'platform';

  console.log("L22", { potentialSubdomain });
  if (potentialSubdomain && potentialSubdomain !== 'platform') {
      console.log("L23 - Entering tenant lookup block");
      const prismaEdge = new PrismaClient();
      try {
        console.log('L26 - Querying for tenant by domain:', potentialSubdomain);
        // Use the Edge-compatible client for this query.
        const tenantByDomain = await prismaEdge.tenant.findFirst({
            where: { domain: potentialSubdomain },
        });

        if (tenantByDomain) {
            console.log("L32 - Found tenant by domain:", tenantByDomain);
            tenantId = tenantByDomain.id;
        } else {
            console.log("L35 - Tenant not found by domain, falling back to ID check:", potentialSubdomain);
            const tenantById = await prismaEdge.tenant.findUnique({
                where: { id: potentialSubdomain },
            });
            if (tenantById) {
                console.log("L40 - Found tenant by ID:", tenantById);
                tenantId = tenantById.id;
            } else {
                console.log("L43 - Tenant not found by ID either. Falling back to platform.");
            }
        }
      } catch (error) {
        console.log("L47 - Database error during tenant lookup.", { error });
        // Fallback to 'platform' on any database error to avoid crashing.
        console.log("L49 - Falling back to platform tenantId due to error.");
        tenantId = 'platform';
      } finally {
        await prismaEdge.$disconnect();
      }
  }

  console.log("L53 - Setting X-Tenant-Id header:", tenantId);
  response.headers.set('X-Tenant-Id', tenantId);
  console.log("L54", { finalMiddlewareState: { hostname, potentialSubdomain, resolvedTenantId: tenantId } });


  // Redirect root path of subdomains to login
  console.log("L58", { potentialSubdomain, pathname });
  if (potentialSubdomain && (pathname === '/' || pathname === '/landing')) {
    console.log("L60 - Redirecting subdomain root to /auth/login");
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  console.log("L64 - Proceeding with original request.");
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.png$).*)',
  ],
};