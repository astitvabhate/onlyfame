import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import authConfig from '@/auth.config';

const { auth } = NextAuth(authConfig);

export default auth((request) => {
    const path = request.nextUrl.pathname;
    const isPublicRoute =
        ['/', '/auth/login', '/auth/register'].includes(path) || path.startsWith('/api/auth/');
    const userRole = request.auth?.user?.role;

    if (!request.auth && !isPublicRoute) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    if (request.auth && (path === '/auth/login' || path === '/auth/register')) {
        return NextResponse.redirect(
            new URL(userRole === 'caster' ? '/caster/dashboard' : '/actor/dashboard', request.url)
        );
    }

    if (userRole === 'actor' && path.startsWith('/caster')) {
        return NextResponse.redirect(new URL('/actor/dashboard', request.url));
    }

    if (userRole === 'caster' && path.startsWith('/actor')) {
        return NextResponse.redirect(new URL('/caster/dashboard', request.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
