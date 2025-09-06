
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function middleware(request: NextRequest) {
  console.log('L5');const url = request.nextUrl.clone();
  console.log('L6');const hostname = request.headers.get('host') || '';
  console.log('L7');const pathname = url.pathname;

  console.log('L9');const isApiOrInternal = pathname.startsWith('/api/') || pathname.startsWith('/_next/') || /\.(png|ico|svg|jpg|jpeg|css|js)$/.test(pathname);
  console.log('L10');if (isApiOrInternal) {
    console.log('L11');return NextResponse.next();
  }

  // Handle localhost and production domains by extracting the first part as the potential subdomain.
  // e.g., 'brainqy.localhost:9002' -> 'brainqy', 'guruji.bhashasetu.com' -> 'guruji'
  console.log('L16');const domainParts = hostname.split('.');
  console.log('L17');const potentialSubdomain = (domainParts.length > 2 || hostname.includes('localhost')) && domainParts[0] !== 'www' ? domainParts[0] : null;

  console.log('L19');const response = NextResponse.next();
  console.log('L20');let tenantId = 'platform';

  console.log('L22');if (potentialSubdomain && potentialSubdomain !== 'platform') {
      console.log('L23');try {
        // First, check if the subdomain matches a custom 'tenantDomain'.
        // Use findFirst instead of findUnique for non-unique fields.
        console.log('L26');const tenantByDomain = await db.tenant.findFirst({
            where: { domain: potentialSubdomain },
        });

        console.log('L30');if (tenantByDomain) {
            // If a match is found, use its actual ID as the tenantId.
            console.log('L32');tenantId = tenantByDomain.id;
        } else {
            // Fallback: check if the subdomain matches a tenant's ID directly.
            console.log('L35');const tenantById = await db.tenant.findUnique({
                where: { id: potentialSubdomain },
            });
            console.log('L38');if (tenantById) {
                console.log('L39');tenantId = tenantById.id;
            } else {
              // If neither matches, it might be an invalid subdomain, but we pass it along.
              // The application logic will handle whether it's a valid tenant.
              console.log('L43');tenantId = potentialSubdomain;
            }
        }
      } catch (error) {
        console.log('L47');console.error('[Middleware] Database error:', error);
        // Fallback to platform on db error to avoid crashing
        console.log('L49');tenantId = 'platform';
      }
  }

  console.log('L53');response.headers.set('X-Tenant-Id', tenantId);
  console.log('L54');console.log(`[Middleware] Host: ${hostname}, Subdomain: ${potentialSubdomain}, Resolved Tenant ID: ${tenantId}`);

  // If the user is on a tenant subdomain but tries to access a public-only page like '/',
  // redirect them to the tenant-specific login page.
  console.log('L58');if (potentialSubdomain && (pathname === '/' || pathname === '/landing')) {
    console.log('L59');url.pathname = '/auth/login';
    console.log('L60');console.log(`[Middleware] Redirecting from root of subdomain '${potentialSubdomain}' to ${url.pathname}`);
    console.log('L61');return NextResponse.redirect(url);
  }

  console.log('L64');return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.png$).*)',
  ],
};
