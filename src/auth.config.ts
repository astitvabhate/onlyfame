import type { NextAuthConfig } from 'next-auth';

const authSecret =
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    (process.env.NODE_ENV !== 'production' ? 'local-dev-only-change-me' : undefined);

const authConfig = {
    secret: authSecret,
    pages: {
        signIn: '/auth/login',
    },
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as { role?: 'actor' | 'caster' }).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub || '';
                session.user.role = (token.role as 'actor' | 'caster') || 'actor';
            }
            return session;
        },
    },
    providers: [],
} satisfies NextAuthConfig;

export default authConfig;
