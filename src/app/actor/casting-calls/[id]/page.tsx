
import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { DashboardNav } from '@/components/DashboardNav';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function CastingCallDetailPage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    const { data: actorProfile } = await supabase
        .from('actor_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

    // Get the casting call
    const { data: castingCall, error } = await supabase
        .from('casting_calls')
        .select(`
            *,
            casting_profile:casting_profiles(
                company_name,
                verified,
                website,
                description
            )
        `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching casting call:', error);
    }

    if (error || !castingCall) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
                <div className="card max-w-lg w-full border-red-500/30 bg-red-500/10">
                    <h1 className="text-xl font-bold text-red-400 mb-2">Failed to Load Casting Call</h1>
                    <p className="text-neutral-300 mb-4">
                        We could not find the casting call with ID: <code className="bg-black/30 p-1 rounded">{id}</code>
                    </p>
                    <div className="p-4 bg-black/50 rounded font-mono text-sm text-red-200 overflow-auto">
                        {error ? JSON.stringify(error, null, 2) : 'No data returned (likely filters or is_active=false)'}
                    </div>
                    <Link href="/actor/casting-calls" className="btn btn-primary mt-6 w-full text-center">
                        Back to List
                    </Link>
                </div>
            </div>
        );
    }

    // Check if actor already applied (only if actor profile exists)
    let existingApplication = null;
    if (actorProfile) {
        const { data: appData, error: appError } = await supabase
            .from('applications')
            .select('id, status, created_at')
            .eq('casting_call_id', id)
            .eq('actor_id', actorProfile.id)
            .maybeSingle(); // Use maybeSingle to avoid 406/JSON errors if multiple/none

        if (appError) {
            console.error('Error fetching application:', appError);
        }
        existingApplication = appData;
    }

    const requirements = castingCall.requirements as Record<string, unknown> || {};

    return (
        <div className="min-h-screen bg-neutral-950">
            <DashboardNav role="actor" userName={profile?.full_name || 'Actor'} />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back link */}
                <Link
                    href="/actor/casting-calls"
                    className="inline-flex items-center text-neutral-400 hover:text-white mb-6 transition-colors"
                >
                    ← Back to Casting Calls
                </Link>

                {/* Main Card */}
                <div className="card mb-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                {castingCall.title}
                            </h1>
                            <div className="flex items-center gap-3">
                                <span className="text-neutral-400">
                                    {castingCall.casting_profile?.company_name}
                                </span>
                                {castingCall.casting_profile?.verified && (
                                    <span className="badge badge-success">✓ Verified</span>
                                )}
                            </div>
                        </div>

                        {existingApplication ? (
                            <div className="text-right">
                                <span className={`badge badge-${existingApplication.status}`}>
                                    {existingApplication.status.charAt(0).toUpperCase() + existingApplication.status.slice(1)}
                                </span>
                                <p className="text-neutral-500 text-xs mt-1">
                                    Applied {new Date(existingApplication.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        ) : castingCall.is_active ? (
                            <Link
                                href={`/actor/casting-calls/${id}/apply`}
                                className="btn btn-primary"
                            >
                                Apply Now
                            </Link>
                        ) : (
                            <span className="badge bg-neutral-700 text-neutral-400">Closed</span>
                        )}
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-white mb-3">About This Role</h2>
                        <p className="text-neutral-300 whitespace-pre-wrap leading-relaxed">
                            {castingCall.description || 'No description provided.'}
                        </p>
                    </div>

                    {/* Requirements */}
                    {Object.keys(requirements).length > 0 && (
                        <div className="mb-6 p-4 rounded-xl bg-neutral-800/50 border border-neutral-700">
                            <h2 className="text-lg font-semibold text-white mb-4">Requirements</h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {requirements.age_range ? (
                                    <div>
                                        <span className="text-neutral-500 text-sm">Age Range</span>
                                        <p className="text-white">
                                            {String((requirements.age_range as { min: number; max: number }).min)} - {String((requirements.age_range as { min: number; max: number }).max)} years
                                        </p>
                                    </div>
                                ) : null}

                                {requirements.gender ? (
                                    <div>
                                        <span className="text-neutral-500 text-sm">Gender</span>
                                        <p className="text-white">
                                            {Array.isArray(requirements.gender)
                                                ? (requirements.gender as string[]).join(', ')
                                                : String(requirements.gender)}
                                        </p>
                                    </div>
                                ) : null}

                                {requirements.experience_level ? (
                                    <div>
                                        <span className="text-neutral-500 text-sm">Experience</span>
                                        <p className="text-white capitalize">{String(requirements.experience_level)}</p>
                                    </div>
                                ) : null}

                                {requirements.languages ? (
                                    <div>
                                        <span className="text-neutral-500 text-sm">Languages</span>
                                        <p className="text-white">
                                            {Array.isArray(requirements.languages)
                                                ? (requirements.languages as string[]).join(', ')
                                                : String(requirements.languages)}
                                        </p>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    )}

                    {/* Dates */}
                    <div className="flex flex-wrap gap-6 text-sm">
                        <div>
                            <span className="text-neutral-500">Posted</span>
                            <p className="text-neutral-300">{new Date(castingCall.created_at).toLocaleDateString()}</p>
                        </div>
                        {castingCall.deadline && (
                            <div>
                                <span className="text-neutral-500">Deadline</span>
                                <p className="text-neutral-300">{new Date(castingCall.deadline).toLocaleDateString()}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* About the Caster */}
                {castingCall.casting_profile?.description && (
                    <div className="card">
                        <h2 className="text-lg font-semibold text-white mb-3">About the Caster</h2>
                        <p className="text-neutral-400 mb-4">{castingCall.casting_profile.description}</p>
                        {castingCall.casting_profile.website && (
                            <a
                                href={castingCall.casting_profile.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-400 hover:text-primary-300 text-sm"
                            >
                                Visit Website →
                            </a>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
