import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // Función para validar si el token es válido
  const isValidToken = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      
      // Verificar si el token no ha expirado
      if (payload.exp && payload.exp < now) {
        return false;
      }
      
      // Verificar que tenga los campos necesarios
      return !!(payload.id && payload.role);
    } catch (error) {
      return false;
    }
  };

  // Proteger rutas específicas de roles
  if (pathname.startsWith('/admin')) {
    if (!token || !isValidToken(token)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (pathname.startsWith('/dictator')) {
    if (!token || !isValidToken(token)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (pathname.startsWith('/sponsor')) {
    if (!token || !isValidToken(token)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Solo redirigir de login a welcome si el token es VÁLIDO
  if (pathname === '/login' && token && isValidToken(token)) {
    return NextResponse.redirect(new URL('/welcome', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/admin/:path*',
    '/dictator/:path*', 
    '/sponsor/:path*'
  ],
};
