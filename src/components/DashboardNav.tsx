'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

interface DashboardNavProps {
    role: 'actor' | 'caster';
    userName: string;
}

export function DashboardNav({ role, userName }: DashboardNavProps) {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push('/auth/login');
        router.refresh();
    };

    const actorLinks = [
        { href: '/actor/dashboard', label: 'Overview' },
        { href: '/actor/casting-calls', label: 'Open calls' },
        { href: '/actor/applications', label: 'Auditions' },
        { href: '/actor/profile', label: 'Profile' },
    ];

    const casterLinks = [
        { href: '/caster/dashboard', label: 'Overview' },
        { href: '/caster/create-call', label: 'Create call' },
        { href: '/caster/calls', label: 'Calls' },
        { href: '/caster/applications', label: 'Review' },
    ];

    const links = role === 'actor' ? actorLinks : casterLinks;

    return (
        <header className="sticky top-0 z-50 border-b border-white/8 bg-[rgba(16,12,9,0.85)] backdrop-blur-xl">
            <div className="page-container">
                <div className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center justify-between gap-4">
                        <Link href={`/${role}/dashboard`} className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(224,175,86,0.35)] bg-[rgba(224,175,86,0.08)] text-sm font-semibold text-[var(--accent)]">
                                OF
                            </div>
                            <div>
                                <p className="font-[var(--font-serif)] text-xl tracking-[0.08em] text-[var(--text)]">
                                    ONLYFAME
                                </p>
                                <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                                    {role === 'actor' ? 'Actor workspace' : 'Casting workspace'}
                                </p>
                            </div>
                        </Link>

                        <button onClick={handleLogout} className="btn btn-ghost md:hidden">
                            Sign out
                        </button>
                    </div>

                    <nav className="flex flex-wrap items-center gap-2">
                        {links.map((link) => {
                            const active =
                                pathname === link.href ||
                                (link.href !== `/${role}/dashboard` && pathname?.startsWith(link.href));

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`rounded-full px-4 py-2 text-sm font-medium ${
                                        active
                                            ? 'bg-[rgba(224,175,86,0.14)] text-[var(--text)]'
                                            : 'text-[var(--muted)] hover:bg-white/5 hover:text-[var(--text)]'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="hidden items-center gap-4 md:flex">
                        <div className="rounded-full border border-white/8 bg-white/4 px-4 py-2 text-right">
                            <p className="text-sm text-[var(--text)]">{userName}</p>
                            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                                {role === 'actor' ? 'Talent profile' : 'Hiring team'}
                            </p>
                        </div>
                        <button onClick={handleLogout} className="btn btn-secondary">
                            Sign out
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
