'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/types';

export default function RegisterPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>('actor');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const roleParam = searchParams.get('role');
        if (roleParam === 'actor' || roleParam === 'caster') {
            setRole(roleParam);
        }
    }, [searchParams]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const supabase = createClient();

        // Sign up with Supabase Auth
        const { data, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: role,
                },
            },
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        if (data.user) {
            // The profile and role-specific profiles are now created automatically 
            // by a database trigger (on_auth_user_created) in Supabase.
            // We just need to redirect the user to the appropriate page.

            if (role === 'actor') {
                router.push('/actor/dashboard');
            } else {
                router.push('/caster/dashboard');
            }
        }
    };

    return (
        <div className="min-h-screen gradient-animated flex items-center justify-center px-4 py-12">
            {/* Background decorations */}
            <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-accent-500/10 rounded-full blur-3xl"></div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                            <span className="text-2xl">⭐</span>
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
                            ONLYFAME
                        </span>
                    </Link>
                </div>

                {/* Register Card */}
                <div className="card">
                    <h1 className="text-2xl font-bold text-white text-center mb-2">Create Your Account</h1>
                    <p className="text-neutral-400 text-center mb-8">Join the future of casting</p>

                    <form onSubmit={handleRegister} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-3">
                                I am a...
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setRole('actor')}
                                    className={`p-4 rounded-xl border-2 transition-all ${role === 'actor'
                                        ? 'border-primary-500 bg-primary-500/10'
                                        : 'border-neutral-700 bg-neutral-800/50 hover:border-neutral-600'
                                        }`}
                                >
                                    <div className="text-3xl mb-2">🎭</div>
                                    <div className={`font-semibold ${role === 'actor' ? 'text-primary-300' : 'text-white'}`}>
                                        Actor
                                    </div>
                                    <div className="text-xs text-neutral-500 mt-1">Looking for roles</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('caster')}
                                    className={`p-4 rounded-xl border-2 transition-all ${role === 'caster'
                                        ? 'border-primary-500 bg-primary-500/10'
                                        : 'border-neutral-700 bg-neutral-800/50 hover:border-neutral-600'
                                        }`}
                                >
                                    <div className="text-3xl mb-2">🎬</div>
                                    <div className={`font-semibold ${role === 'caster' ? 'text-primary-300' : 'text-white'}`}>
                                        Casting Director
                                    </div>
                                    <div className="text-xs text-neutral-500 mt-1">Finding talent</div>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-neutral-300 mb-2">
                                Full Name
                            </label>
                            <input
                                id="fullName"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="input"
                                placeholder="Your full name"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input"
                                placeholder="••••••••"
                                minLength={6}
                                required
                            />
                            <p className="text-xs text-neutral-500 mt-1">Minimum 6 characters</p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Creating account...
                                </span>
                            ) : (
                                `Create ${role === 'actor' ? 'Actor' : 'Casting'} Account`
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-neutral-400">
                            Already have an account?{' '}
                            <Link href="/auth/login" className="text-primary-400 hover:text-primary-300 font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
