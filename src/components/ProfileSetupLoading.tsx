'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function ProfileSetupLoading() {
    const router = useRouter();
    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/auth/login');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-neutral-950 text-white">
            <div className="text-center p-8 max-w-md">
                <div className="w-16 h-16 rounded-full border-4 border-primary-500/30 border-t-primary-500 animate-spin mx-auto mb-6"></div>
                <h2 className="text-xl font-semibold mb-2">Setting up your profile...</h2>
                <p className="text-neutral-400 mb-8">
                    We&apos;re creating your secure workspace. This usually takes just a moment.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="btn btn-primary w-full"
                    >
                        Refresh Page
                    </button>

                    <button
                        onClick={handleLogout}
                        className="btn btn-ghost text-neutral-400 hover:text-white w-full"
                    >
                        Sign Out (If stuck)
                    </button>
                </div>
            </div>
        </div>
    );
}
