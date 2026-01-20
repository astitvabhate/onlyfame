import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { DashboardNav } from '@/components/DashboardNav';
import { ApplicationActions } from './ApplicationActions';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function CasterCallDetailPage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

    const { data: casterProfile } = await supabase
        .from('casting_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

    // Get the casting call (verify ownership)
    const { data: castingCall, error } = await supabase
        .from('casting_calls')
        .select('*')
        .eq('id', id)
        .eq('caster_id', casterProfile?.id)
        .single();

    if (error || !castingCall) {
        notFound();
    }

    // Get all applications for this call
    const { data: applications } = await supabase
        .from('applications')
        .select(`
            *,
            actor:actor_profiles(
                id,
                bio,
                experience_level,
                profile:profiles(full_name, avatar_url)
            )
        `)
        .eq('casting_call_id', id)
        .order('created_at', { ascending: false });

    const statusCounts = {
        applied: applications?.filter(a => a.status === 'applied').length || 0,
        shortlisted: applications?.filter(a => a.status === 'shortlisted').length || 0,
        selected: applications?.filter(a => a.status === 'selected').length || 0,
        rejected: applications?.filter(a => a.status === 'rejected').length || 0,
    };

    return (
        <div className="min-h-screen bg-neutral-950">
            <DashboardNav role="caster" userName={profile?.full_name || 'Caster'} />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back link */}
                <Link
                    href="/caster/calls"
                    className="inline-flex items-center text-neutral-400 hover:text-white mb-6 transition-colors"
                >
                    ← Back to My Calls
                </Link>

                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                            {castingCall.title}
                        </h1>
                        <div className="flex items-center gap-4 text-sm">
                            <span className={`badge ${castingCall.is_active ? 'badge-success' : 'bg-neutral-700 text-neutral-400'}`}>
                                {castingCall.is_active ? 'Active' : 'Closed'}
                            </span>
                            <span className="text-neutral-500">
                                Posted {new Date(castingCall.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="card text-center">
                        <p className="text-2xl font-bold text-blue-400">{statusCounts.applied}</p>
                        <p className="text-neutral-500 text-sm">New</p>
                    </div>
                    <div className="card text-center">
                        <p className="text-2xl font-bold text-amber-400">{statusCounts.shortlisted}</p>
                        <p className="text-neutral-500 text-sm">Shortlisted</p>
                    </div>
                    <div className="card text-center">
                        <p className="text-2xl font-bold text-emerald-400">{statusCounts.selected}</p>
                        <p className="text-neutral-500 text-sm">Selected</p>
                    </div>
                    <div className="card text-center">
                        <p className="text-2xl font-bold text-red-400">{statusCounts.rejected}</p>
                        <p className="text-neutral-500 text-sm">Rejected</p>
                    </div>
                </div>

                {/* Applications */}
                <h2 className="text-xl font-semibold text-white mb-4">
                    Applications ({applications?.length || 0})
                </h2>

                {applications && applications.length > 0 ? (
                    <div className="space-y-4">
                        {applications.map((app) => (
                            <div key={app.id} className="card card-hover">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
                                            {app.actor?.profile?.full_name?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">
                                                {app.actor?.profile?.full_name || 'Unknown Actor'}
                                            </h3>
                                            <p className="text-neutral-500 text-sm capitalize">
                                                {app.actor?.experience_level || 'No experience info'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className={`badge badge-${app.status}`}>
                                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                        </span>

                                        {app.audition_video_url && (
                                            <a
                                                href={app.audition_video_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-ghost text-sm"
                                            >
                                                🎬 Video
                                            </a>
                                        )}

                                        <Link
                                            href={`/caster/applications/${app.id}`}
                                            className="btn btn-secondary text-sm"
                                        >
                                            Review
                                        </Link>
                                    </div>
                                </div>

                                {app.cover_letter && (
                                    <p className="mt-4 text-neutral-400 text-sm line-clamp-2">
                                        {app.cover_letter}
                                    </p>
                                )}

                                {/* Quick Actions */}
                                {app.status === 'applied' && (
                                    <ApplicationActions applicationId={app.id} />
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card text-center py-16">
                        <span className="text-5xl mb-4 block">📭</span>
                        <h3 className="text-xl font-medium text-white mb-2">No applications yet</h3>
                        <p className="text-neutral-500">Applications will appear here when actors apply</p>
                    </div>
                )}
            </main>
        </div>
    );
}
