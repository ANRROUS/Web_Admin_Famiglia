import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secret-key-change-this'
);

export async function middleware(req: NextRequest) {
  // Rutas protegidas
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    const token = req.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Redirigir root a dashboard o login
  if (req.nextUrl.pathname === '/') {
    const token = req.cookies.get('admin_token')?.value;
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    } else {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*'],
};
