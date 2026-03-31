'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            setError('Invalid email or password.');
            setLoading(false);
            return;
        }
        router.refresh();
        router.push('/actor/dashboard');
    };

    return (
        <div className="page-shell">
            <div className="page-container grid min-h-screen gap-10 py-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
                <div className="hidden lg:block">
                    <span className="eyebrow">Trusted casting, without the chaos</span>
                    <h1 className="mt-8 font-[var(--font-serif)] text-6xl leading-[1.02]">
                        Return to a workspace built for serious auditions.
                    </h1>
                    <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted)]">
                        Sign in to continue reviewing submissions, tracking decisions, or preparing your next role
                        application with clear status and stronger trust cues.
                    </p>
                    <div className="mt-10 grid max-w-xl gap-4 md:grid-cols-2">
                        <div className="surface-soft p-5">
                            <p className="section-label">Actors</p>
                            <p className="mt-3 text-[var(--text)]">Track profile readiness, open calls, and submission status in one place.</p>
                        </div>
                        <div className="surface-soft p-5">
                            <p className="section-label">Casters</p>
                            <p className="mt-3 text-[var(--text)]">Move from role brief to shortlist with clean, review-ready applicant context.</p>
                        </div>
                    </div>
                </div>

                <div className="mx-auto w-full max-w-lg card">
                    <Link href="/" className="inline-flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(224,175,86,0.35)] bg-[rgba(224,175,86,0.08)] text-sm font-semibold text-[var(--accent)]">
                            OF
                        </div>
                        <div>
                            <p className="font-[var(--font-serif)] text-2xl tracking-[0.08em]">ONLYFAME</p>
                            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Secure sign in</p>
                        </div>
                    </Link>

                    <div className="mt-8">
                        <p className="section-label">Welcome back</p>
                        <h2 className="mt-3 font-[var(--font-serif)] text-4xl">Sign in to your workspace</h2>
                        <p className="mt-3 text-sm text-[var(--muted)]">
                            Your role, reviews, and application history stay organized here.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="mt-8 space-y-5">
                        {error ? (
                            <div className="rounded-2xl border border-[rgba(214,106,94,0.3)] bg-[rgba(214,106,94,0.1)] px-4 py-3 text-sm text-[#efb3ac]">
                                {error}
                            </div>
                        ) : null}

                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-medium text-[var(--text)]">
                                Email
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
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? 'Signing in...' : 'Continue'}
                        </button>
                    </form>

                    <p className="mt-8 text-sm text-[var(--muted)]">
                        New to ONLYFAME?{' '}
                        <Link href="/auth/register" className="text-[var(--text)] underline decoration-[rgba(224,175,86,0.6)] underline-offset-4">
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
