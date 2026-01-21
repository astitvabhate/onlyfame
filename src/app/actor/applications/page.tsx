import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { DashboardNav } from '@/components/DashboardNav';

export default async function ActorApplicationsPage() {
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

    const { data: applications } = await supabase
        .from('applications')
        .select(`
      *,
      casting_call:casting_calls(
        title,
        description,
        casting_profile:casting_profiles(
          company_name,
          verified
        )
      )
    `)
        .eq('actor_id', actorProfile?.id)
        .order('created_at', { ascending: false });

    const statusGroups = {
        applied: applications?.filter(a => a.status === 'applied') || [],
        shortlisted: applications?.filter(a => a.status === 'shortlisted') || [],
        selected: applications?.filter(a => a.status === 'selected') || [],
        rejected: applications?.filter(a => a.status === 'rejected') || [],
    };

    return (
        <div className="min-h-screen bg-neutral-950">
            <DashboardNav role="actor" userName={profile?.full_name || 'Actor'} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">My Applications</h1>
                    <p className="text-neutral-400">Track the status of your audition submissions</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="card text-center">
                        <p className="text-2xl font-bold text-blue-400">{statusGroups.applied.length}</p>
                        <p className="text-neutral-500 text-sm">Applied</p>
                    </div>
                    <div className="card text-center">
                        <p className="text-2xl font-bold text-amber-400">{statusGroups.shortlisted.length}</p>
                        <p className="text-neutral-500 text-sm">Shortlisted</p>
                    </div>
                    <div className="card text-center">
                        <p className="text-2xl font-bold text-emerald-400">{statusGroups.selected.length}</p>
                        <p className="text-neutral-500 text-sm">Selected</p>
                    </div>
                    <div className="card text-center">
                        <p className="text-2xl font-bold text-red-400">{statusGroups.rejected.length}</p>
                        <p className="text-neutral-500 text-sm">Rejected</p>
                    </div>
                </div>

                {/* Applications List */}
                {applications && applications.length > 0 ? (
                    <div className="space-y-4">
                        {applications.map((app) => (
                            <div key={app.id} className="card card-hover">
                                <div className="flex items-center justify-between">
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-white text-lg">
                                                {app.casting_call?.title}
                                            </h3>
                                            <span className={`badge badge-${app.status}`}>
                                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-neutral-400 text-sm">
                                                {app.casting_call?.casting_profile?.company_name}
                                            </span>
                                            {app.casting_call?.casting_profile?.verified && (
                                                <span className="text-emerald-400 text-xs">✓ Verified</span>
                                            )}
                                        </div>
                                        <p className="text-neutral-500 text-sm mt-2">
                                            Applied on {new Date(app.created_at).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {app.audition_video_url && (
                                            <a
                                                href={app.audition_video_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-ghost text-sm"
                                            >
                                                View Video
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Show contact info if selected */}
                                {app.status === 'selected' && (
                                    <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                                        <p className="text-emerald-300 font-medium mb-2">🎉 Congratulations! You&apos;ve been selected!</p>
                                        <p className="text-emerald-300/70 text-sm">
                                            The casting team will contact you with further details.
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card text-center py-16">
                        <span className="text-5xl mb-4 block">📋</span>
                        <h3 className="text-xl font-medium text-white mb-2">No applications yet</h3>
                        <p className="text-neutral-500 mb-6">Start applying to casting calls to see your applications here</p>
                        <Link href="/actor/casting-calls" className="btn btn-primary">
                            Browse Casting Calls
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
