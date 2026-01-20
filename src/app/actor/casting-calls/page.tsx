import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { DashboardNav } from '@/components/DashboardNav';

export default async function CastingCallsPage() {
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

    // Get all active casting calls
    const { data: castingCalls } = await supabase
        .from('casting_calls')
        .select(`
      *,
      casting_profile:casting_profiles(
        company_name,
        verified
      )
    `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    // Get actor's existing applications
    const { data: applications } = await supabase
        .from('applications')
        .select('casting_call_id')
        .eq('actor_id', actorProfile?.id);

    const appliedCallIds = applications?.map(a => a.casting_call_id) || [];

    return (
        <div className="min-h-screen bg-neutral-950">
            <DashboardNav role="actor" userName={profile?.full_name || 'Actor'} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Casting Calls</h1>
                    <p className="text-neutral-400">Browse available roles and apply with your audition</p>
                </div>

                {/* Filters would go here */}

                {/* Casting Calls Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {castingCalls && castingCalls.length > 0 ? (
                        castingCalls.map((call) => {
                            const hasApplied = appliedCallIds.includes(call.id);
                            const requirements = call.requirements as Record<string, unknown> || {};

                            return (
                                <div key={call.id} className="card card-hover flex flex-col">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="font-semibold text-white text-lg">{call.title}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-neutral-500 text-sm">
                                                    {call.casting_profile?.company_name}
                                                </span>
                                                {call.casting_profile?.verified && (
                                                    <span className="badge badge-success text-xs">✓ Verified</span>
                                                )}
                                            </div>
                                        </div>
                                        {hasApplied && (
                                            <span className="badge badge-primary">Applied</span>
                                        )}
                                    </div>

                                    <p className="text-neutral-400 text-sm mb-4 flex-grow line-clamp-3">
                                        {call.description || 'No description provided'}
                                    </p>

                                    {/* Requirements */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {requirements.age_range ? (
                                            <span className="badge bg-neutral-800 text-neutral-300">
                                                Age: {String((requirements.age_range as { min: number; max: number }).min)}-{String((requirements.age_range as { min: number; max: number }).max)}
                                            </span>
                                        ) : null}
                                        {requirements.gender ? (
                                            <span className="badge bg-neutral-800 text-neutral-300">
                                                {String(Array.isArray(requirements.gender) ? (requirements.gender as string[]).join(', ') : requirements.gender)}
                                            </span>
                                        ) : null}
                                        {requirements.experience_level ? (
                                            <span className="badge bg-neutral-800 text-neutral-300 capitalize">
                                                {String(requirements.experience_level)}
                                            </span>
                                        ) : null}
                                    </div>

                                    {/* Posted date */}
                                    <p className="text-neutral-600 text-xs mb-4">
                                        Posted {new Date(call.created_at).toLocaleDateString()}
                                        {call.deadline && ` • Deadline: ${new Date(call.deadline).toLocaleDateString()}`}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/actor/casting-calls/${call.id}`}
                                            className="btn btn-secondary flex-1 text-sm py-2"
                                        >
                                            View Details
                                        </Link>
                                        {!hasApplied && (
                                            <Link
                                                href={`/actor/casting-calls/${call.id}/apply`}
                                                className="btn btn-primary flex-1 text-sm py-2"
                                            >
                                                Apply Now
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full">
                            <div className="card text-center py-16">
                                <span className="text-5xl mb-4 block">🎬</span>
                                <h3 className="text-xl font-medium text-white mb-2">No casting calls available</h3>
                                <p className="text-neutral-500">Check back soon for new opportunities!</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
