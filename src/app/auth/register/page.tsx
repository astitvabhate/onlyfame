'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import type { UserRole } from '@/types';

function RegisterContent() {
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

        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fullName,
                email,
                password,
                role,
            }),
        });

        const payload = await response.json();
        if (!response.ok) {
            setError(payload.error || 'Registration failed.');
            setLoading(false);
            return;
        }

        await signIn('credentials', {
            email,
            password,
            redirect: false,
        });
        router.refresh();
        router.push(role === 'actor' ? '/actor/dashboard' : '/caster/dashboard');
    };

    return (
        <div className="page-shell">
            <div className="page-container grid min-h-screen gap-10 py-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
                <div className="hidden lg:block">
                    <span className="eyebrow">Guided onboarding for both sides of casting</span>
                    <h1 className="mt-8 font-[var(--font-serif)] text-6xl leading-[1.02]">
                        Build a profile people can trust before the first message is sent.
                    </h1>
                    <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted)]">
                        New members enter through guided activation. Actors prepare headshots and profile context.
                        Casting teams set up company identity, verification cues, and their first brief.
                    </p>
                    <div className="mt-10 space-y-4 max-w-xl">
                        <div className="surface-soft p-5">
                            <p className="section-label">Actor onboarding</p>
                            <p className="mt-3 text-[var(--text)]">Profile basics, headshots, languages, location, and readiness before applying.</p>
                        </div>
                        <div className="surface-soft p-5">
                            <p className="section-label">Casting onboarding</p>
                            <p className="mt-3 text-[var(--text)]">Company identity, trust cues, and a structured first casting call.</p>
                        </div>
                    </div>
                </div>

                <div className="mx-auto w-full max-w-xl card">
                    <Link href="/" className="inline-flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(224,175,86,0.35)] bg-[rgba(224,175,86,0.08)] text-sm font-semibold text-[var(--accent)]">
                            OF
                        </div>
                        <div>
                            <p className="font-[var(--font-serif)] text-2xl tracking-[0.08em]">ONLYFAME</p>
                            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Create your workspace</p>
                        </div>
                    </Link>

                    <div className="mt-8">
                        <p className="section-label">Registration</p>
                        <h2 className="mt-3 font-[var(--font-serif)] text-4xl">Create your account</h2>
                        <p className="mt-3 text-sm text-[var(--muted)]">
                            Choose the side of the workflow you are entering first. You can still collaborate across the platform later.
                        </p>
                    </div>

                    <form onSubmit={handleRegister} className="mt-8 space-y-5">
                        {error ? (
                            <div className="rounded-2xl border border-[rgba(214,106,94,0.3)] bg-[rgba(214,106,94,0.1)] px-4 py-3 text-sm text-[#efb3ac]">
                                {error}
                            </div>
                        ) : null}

                        <div className="grid gap-4 sm:grid-cols-2">
                            <button
                                type="button"
                                onClick={() => setRole('actor')}
                                className={`rounded-[1.5rem] border p-5 text-left ${
                                    role === 'actor'
                                        ? 'border-[rgba(224,175,86,0.4)] bg-[rgba(224,175,86,0.08)]'
                                        : 'border-white/8 bg-white/3'
                                }`}
                            >
                                <p className="section-label">Actor</p>
                                <p className="mt-3 text-lg font-semibold text-[var(--text)]">Show your fit with confidence</p>
                                <p className="mt-2 text-sm text-[var(--muted)]">Prepare a role-ready profile and track your auditions clearly.</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setRole('caster')}
                                className={`rounded-[1.5rem] border p-5 text-left ${
                                    role === 'caster'
                                        ? 'border-[rgba(108,157,202,0.35)] bg-[rgba(108,157,202,0.08)]'
                                        : 'border-white/8 bg-white/3'
                                }`}
                            >
                                <p className="section-label">Casting team</p>
                                <p className="mt-3 text-lg font-semibold text-[var(--text)]">Review talent with structure</p>
                                <p className="mt-2 text-sm text-[var(--muted)]">Publish better briefs and manage applicants in one workflow.</p>
                            </button>
                        </div>

                        <div>
                            <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-[var(--text)]">
                                Full name
                            </label>
                            <input
                                id="fullName"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="input"
                                placeholder={role === 'actor' ? 'Your name as seen by casting teams' : 'Your full name'}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-medium text-[var(--text)]">
                                Work email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input"
                                placeholder="name@studio.com"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="mb-2 block text-sm font-medium text-[var(--text)]">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input"
                                placeholder="Minimum 6 characters"
                                minLength={6}
                                required
                            />
                        </div>

                        <div className="rounded-[1.5rem] border border-white/8 bg-white/3 p-4 text-sm text-[var(--muted)]">
                            Contact details stay protected inside the platform until the right stage in the audition process.
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? 'Creating account...' : `Create ${role === 'actor' ? 'actor' : 'casting'} workspace`}
                        </button>
                    </form>

                    <p className="mt-8 text-sm text-[var(--muted)]">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="text-[var(--text)] underline decoration-[rgba(224,175,86,0.6)] underline-offset-4">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="page-shell flex items-center justify-center text-[var(--text)]">Loading...</div>}>
            <RegisterContent />
        </Suspense>
    );
}
