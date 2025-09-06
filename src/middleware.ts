import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Instantiate a new Prisma Client for the Edge runtime
const prismaEdge = new PrismaClient();

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = url;

  // Skip middleware for API, internal Next.js routes, and static files.
  const isApiOrInternal = pathname.startsWith('/api/') || pathname.startsWith('/_next/') || /\.(png|ico|svg|jpg|jpeg|css|js)$/.test(pathname);
  if (isApiOrInternal) {
    return NextResponse.next();
  }

  const hostname = request.headers.get('host') || '';
  const domainParts = hostname.split('.');
  const potentialSubdomain = (domainParts.length > 2 && domainParts[0] !== 'www') || (hostname.includes('localhost') && domainParts.length > 1 && domainParts[0] !== 'localhost') ? domainParts[0] : null;

  const response = NextResponse.next();
  let tenantId = 'platform';

  if (potentialSubdomain && potentialSubdomain !== 'platform') {
      try {
        // Use the Edge-specific client for this query.
        const tenant = await prismaEdge.tenant.findFirst({
            where: { 
                OR: [
                    { domain: potentialSubdomain },
                    { id: potentialSubdomain }
                ]
            },
        });

        if (tenant) {
            tenantId = tenant.id;
        } else {
            console.log(`[Middleware] Tenant not found by domain or ID '${potentialSubdomain}'. Falling back to platform.`);
            // Fallback to platform if no tenant is found
            tenantId = 'platform';
        }
      } catch (error) {
        console.error('[Middleware] Database error during tenant lookup.', { error });
        // Fallback to 'platform' on any database error to avoid crashing.
        tenantId = 'platform';
      }
  }

  response.headers.set('X-Tenant-Id', tenantId);
  console.log(`[Middleware] Host: ${hostname}, Subdomain: ${potentialSubdomain || 'none'}, Resolved Tenant ID: ${tenantId}`);

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
