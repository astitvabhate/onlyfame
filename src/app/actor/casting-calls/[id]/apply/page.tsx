'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { DashboardNav } from '@/components/DashboardNav';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function ApplyToCastingCallPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const [profile, setProfile] = useState<{ full_name: string } | null>(null);
    const [actorProfile, setActorProfile] = useState<{ id: string } | null>(null);
    const [castingCall, setCastingCall] = useState<{ title: string; casting_profile?: { company_name: string } } | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [alreadyApplied, setAlreadyApplied] = useState(false);

    // Form state
    const [coverLetter, setCoverLetter] = useState('');
    const [videoUrl, setVideoUrl] = useState('');

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push('/auth/login');
            return;
        }

        // Get profile
        const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();

        // Get actor profile
        const { data: actorData } = await supabase
            .from('actor_profiles')
            .select('id')
            .eq('user_id', user.id)
            .single();

        // Get casting call
        const { data: callData } = await supabase
            .from('casting_calls')
            .select(`
                title,
                casting_profile:casting_profiles(company_name)
            `)
            .eq('id', id)
            .single();

        // Check if already applied
        if (actorData) {
            const { data: existingApp } = await supabase
                .from('applications')
                .select('id')
                .eq('casting_call_id', id)
                .eq('actor_id', actorData.id)
                .single();

            if (existingApp) {
                setAlreadyApplied(true);
            }
        }

        setProfile(profileData);
        setActorProfile(actorData);
        // Transform callData to handle Supabase's array response for joins
        if (callData) {
            const castingProfile = Array.isArray(callData.casting_profile)
                ? callData.casting_profile[0]
                : callData.casting_profile;
            setCastingCall({
                title: callData.title,
                casting_profile: castingProfile
            });
        } else {
            setCastingCall(null);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!actorProfile) {
            setError('Actor profile not found. Please complete your profile first.');
            return;
        }

        setSubmitting(true);
        setError('');

        const supabase = createClient();

        const { error: insertError } = await supabase
            .from('applications')
            .insert({
                casting_call_id: id,
                actor_id: actorProfile.id,
                notes: coverLetter || null,
                audition_video_url: videoUrl || null,
                status: 'applied',
            });

        if (insertError) {
            setError(insertError.message);
            setSubmitting(false);
            return;
        }

        router.push('/actor/applications');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    if (alreadyApplied) {
        return (
            <div className="min-h-screen bg-neutral-950">
                <DashboardNav role="actor" userName={profile?.full_name || 'Actor'} />
                <main className="max-w-2xl mx-auto px-4 py-16 text-center">
                    <div className="card">
                        <span className="text-5xl mb-4 block">✅</span>
                        <h1 className="text-2xl font-bold text-white mb-2">Already Applied</h1>
                        <p className="text-neutral-400 mb-6">
                            You have already submitted an application for this role.
                        </p>
                        <Link href="/actor/applications" className="btn btn-primary">
                            View My Applications
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950">
            <DashboardNav role="actor" userName={profile?.full_name || 'Actor'} />

            <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back link */}
                <Link
                    href={`/actor/casting-calls/${id}`}
                    className="inline-flex items-center text-neutral-400 hover:text-white mb-6 transition-colors"
                >
                    ← Back to Details
                </Link>

                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Apply for Role</h1>
                <p className="text-neutral-400 mb-8">
                    {castingCall?.title} • {castingCall?.casting_profile?.company_name}
                </p>

                <form onSubmit={handleSubmit} className="card">
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300">
                            {error}
                        </div>
                    )}

                    {/* Cover Letter */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            Cover Letter / Message
                        </label>
                        <textarea
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            className="input min-h-[150px]"
                            placeholder="Introduce yourself and explain why you're perfect for this role..."
                        />
                        <p className="text-neutral-500 text-xs mt-1">
                            Tell the caster why you&apos;re interested and what makes you a great fit
                        </p>
                    </div>

                    {/* Audition Video URL */}
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            Audition Video URL
                        </label>
                        <input
                            type="url"
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            className="input"
                            placeholder="https://youtube.com/watch?v=... or https://drive.google.com/..."
                        />
                        <p className="text-neutral-500 text-xs mt-1">
                            Upload your audition to YouTube, Vimeo, or Google Drive and paste the link
                        </p>
                    </div>

                    {/* Info Box */}
                    <div className="mb-8 p-4 rounded-xl bg-primary-500/10 border border-primary-500/30">
                        <p className="text-primary-300 text-sm">
                            💡 <strong>Tip:</strong> Your profile information will be shared with the caster.
                            Make sure your profile is complete and up-to-date.
                        </p>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="btn btn-ghost"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn btn-primary px-8"
                        >
                            {submitting ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
