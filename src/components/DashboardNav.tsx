'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface DashboardNavProps {
    role: 'actor' | 'caster';
    userName: string;
}

export function DashboardNav({ role, userName }: DashboardNavProps) {
    const router = useRouter();

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/');
    };

    const actorLinks = [
        { href: '/actor/dashboard', label: 'Dashboard', icon: '🏠' },
        { href: '/actor/casting-calls', label: 'Casting Calls', icon: '🎬' },
        { href: '/actor/applications', label: 'My Applications', icon: '📋' },
        { href: '/actor/profile', label: 'Profile', icon: '👤' },
    ];

    const casterLinks = [
        { href: '/caster/dashboard', label: 'Dashboard', icon: '🏠' },
        { href: '/caster/create-call', label: 'Create Call', icon: '➕' },
        { href: '/caster/calls', label: 'My Calls', icon: '📢' },
        { href: '/caster/applications', label: 'Applications', icon: '📋' },
    ];

    const links = role === 'actor' ? actorLinks : casterLinks;

    return (
        <nav className="sticky top-0 z-50 glass border-b border-neutral-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href={`/${role}/dashboard`} className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                            <span className="text-lg">⭐</span>
                        </div>
                        <span className="text-lg font-bold text-white hidden sm:inline">ONLYFAME</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="px-4 py-2 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                            >
                                <span>{link.icon}</span>
                                <span className="text-sm font-medium">{link.label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="avatar w-9 h-9 text-sm">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm text-neutral-300 hidden sm:inline">{userName}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="btn btn-ghost text-sm px-3 py-1.5"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="px-3 py-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 flex-shrink-0"
                        >
                            <span className="text-sm">{link.icon}</span>
                            <span className="text-xs font-medium">{link.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
}
