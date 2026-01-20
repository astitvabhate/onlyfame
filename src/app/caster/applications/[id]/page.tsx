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

interface Application {
    id: string;
    status: string;
    cover_letter: string | null;
    audition_video_url: string | null;
    created_at: string;
    casting_call: {
        id: string;
        title: string;
    };
    actor: {
        id: string;
        bio: string | null;
        experience_level: string | null;
        languages: string[] | null;
        height: string | null;
        profile: {
            full_name: string;
            avatar_url: string | null;
            email: string;
        };
    };
}

export default function ReviewApplicationPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const [profile, setProfile] = useState<{ full_name: string } | null>(null);
    const [application, setApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

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

        const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();

        // Get the application with full details
        const { data: appData } = await supabase
            .from('applications')
            .select(`
                *,
                casting_call:casting_calls(id, title),
                actor:actor_profiles(
                    id,
                    bio,
                    experience_level,
                    languages,
                    height,
                    profile:profiles(full_name, avatar_url, email)
                )
            `)
            .eq('id', id)
            .single();

        setProfile(profileData);
        setApplication(appData as Application);
        setLoading(false);
    };

    const updateStatus = async (status: 'shortlisted' | 'selected' | 'rejected') => {
        setUpdating(true);
        const supabase = createClient();

        await supabase
            .from('applications')
            .update({ status })
            .eq('id', id);

        await loadData();
        setUpdating(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    if (!application) {
        return (
            <div className="min-h-screen bg-neutral-950">
                <DashboardNav role="caster" userName={profile?.full_name || 'Caster'} />
                <main className="max-w-4xl mx-auto px-4 py-16 text-center">
                    <div className="card">
                        <span className="text-5xl mb-4 block">❌</span>
                        <h1 className="text-2xl font-bold text-white mb-2">Application Not Found</h1>
                        <Link href="/caster/applications" className="btn btn-primary mt-4">
                            Back to Applications
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950">
            <DashboardNav role="caster" userName={profile?.full_name || 'Caster'} />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back link */}
                <Link
                    href={`/caster/calls/${application.casting_call?.id}`}
                    className="inline-flex items-center text-neutral-400 hover:text-white mb-6 transition-colors"
                >
                    ← Back to {application.casting_call?.title}
                </Link>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Actor Info */}
                    <div className="lg:col-span-1">
                        <div className="card">
                            <div className="text-center mb-4">
                                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-2xl font-bold mb-4">
                                    {application.actor?.profile?.full_name?.charAt(0) || '?'}
                                </div>
                                <h2 className="text-xl font-bold text-white">
                                    {application.actor?.profile?.full_name}
                                </h2>
                                <span className={`badge badge-${application.status} mt-2`}>
                                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                </span>
                            </div>

                            <div className="space-y-3 text-sm">
                                {application.actor?.experience_level && (
                                    <div>
                                        <span className="text-neutral-500">Experience</span>
                                        <p className="text-white capitalize">{application.actor.experience_level}</p>
                                    </div>
                                )}
                                {application.actor?.height && (
                                    <div>
                                        <span className="text-neutral-500">Height</span>
                                        <p className="text-white">{application.actor.height}</p>
                                    </div>
                                )}
                                {application.actor?.languages && (
                                    <div>
                                        <span className="text-neutral-500">Languages</span>
                                        <p className="text-white">{application.actor.languages.join(', ')}</p>
                                    </div>
                                )}
                            </div>

                            {application.actor?.bio && (
                                <div className="mt-4 pt-4 border-t border-neutral-800">
                                    <span className="text-neutral-500 text-sm">Bio</span>
                                    <p className="text-neutral-300 text-sm mt-1">{application.actor.bio}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Application Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Cover Letter */}
                        <div className="card">
                            <h3 className="text-lg font-semibold text-white mb-3">Cover Letter</h3>
                            {application.cover_letter ? (
                                <p className="text-neutral-300 whitespace-pre-wrap">{application.cover_letter}</p>
                            ) : (
                                <p className="text-neutral-500 italic">No cover letter provided</p>
                            )}
                        </div>

                        {/* Audition Video */}
                        <div className="card">
                            <h3 className="text-lg font-semibold text-white mb-3">Audition Video</h3>
                            {application.audition_video_url ? (
                                <div>
                                    <a
                                        href={application.audition_video_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary inline-flex items-center gap-2"
                                    >
                                        🎬 Watch Audition Video
                                    </a>
                                    <p className="text-neutral-500 text-xs mt-2">
                                        Opens in a new tab
                                    </p>
                                </div>
                            ) : (
                                <p className="text-neutral-500 italic">No audition video provided</p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="card">
                            <h3 className="text-lg font-semibold text-white mb-4">Update Status</h3>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => updateStatus('shortlisted')}
                                    disabled={updating || application.status === 'shortlisted'}
                                    className="btn bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 disabled:opacity-50"
                                >
                                    Shortlist
                                </button>
                                <button
                                    onClick={() => updateStatus('selected')}
                                    disabled={updating || application.status === 'selected'}
                                    className="btn bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 disabled:opacity-50"
                                >
                                    Select
                                </button>
                                <button
                                    onClick={() => updateStatus('rejected')}
                                    disabled={updating || application.status === 'rejected'}
                                    className="btn bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 disabled:opacity-50"
                                >
                                    Reject
                                </button>
                            </div>
                            <p className="text-neutral-500 text-xs mt-3">
                                Applied on {new Date(application.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
