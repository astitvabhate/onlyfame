import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;

    // Public routes that don't require auth
    const publicRoutes = ['/', '/auth/login', '/auth/register'];
    const isPublicRoute = publicRoutes.includes(path);

    // If not logged in and trying to access protected route
    if (!user && !isPublicRoute) {
        const url = request.nextUrl.clone();
        url.pathname = '/auth/login';
        return NextResponse.redirect(url);
    }

    // If logged in, check role-based access
    if (user && !isPublicRoute) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile) {
            const isActorRoute = path.startsWith('/actor');
            const isCasterRoute = path.startsWith('/caster');

            // Redirect if accessing wrong role's routes
            if (isActorRoute && profile.role === 'caster') {
                const url = request.nextUrl.clone();
                url.pathname = '/caster/dashboard';
                return NextResponse.redirect(url);
            }

            if (isCasterRoute && profile.role === 'actor') {
                const url = request.nextUrl.clone();
                url.pathname = '/actor/dashboard';
                return NextResponse.redirect(url);
            }
        }
    }

    // Redirect logged-in users away from auth pages
    if (user && (path === '/auth/login' || path === '/auth/register')) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const url = request.nextUrl.clone();
        if (profile?.role === 'actor') {
            url.pathname = '/actor/dashboard';
            return NextResponse.redirect(url);
        } else if (profile?.role === 'caster') {
            url.pathname = '/caster/dashboard';
            return NextResponse.redirect(url);
        }
        // If profile is not yet ready, stay on the page until redirect occurs via layout or client logic
        return supabaseResponse;
    }

    return supabaseResponse;
}
