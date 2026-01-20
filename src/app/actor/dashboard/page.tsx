import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { DashboardNav } from '@/components/DashboardNav';

export default async function ActorDashboard() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth/login');

    // Fetch actor data
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .eq('id', user.id)
        .single();

    if (profile && profile.role !== 'actor') {
        redirect('/caster/dashboard');
    }

    const { data: actorProfile } = await supabase
        .from('actor_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

    const { data: applications } = await supabase
        .from('applications')
        .select(`
      *,
      casting_call:casting_calls(title, description)
    `)
        .eq('actor_id', actorProfile?.id)
        .order('created_at', { ascending: false })
        .limit(5);

    const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);

    // Stats
    const { count: totalApplications } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('actor_id', actorProfile?.id);

    const { count: shortlisted } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('actor_id', actorProfile?.id)
        .eq('status', 'shortlisted');

    const { count: selected } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('actor_id', actorProfile?.id)
        .eq('status', 'selected');

    const isProfileComplete = actorProfile?.age && actorProfile?.bio;

    return (
        <div className="min-h-screen bg-neutral-950">
            <DashboardNav role="actor" userName={profile?.full_name || 'Actor'} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Welcome back, {profile?.full_name?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-neutral-400">Track your auditions and discover new opportunities</p>
                </div>

                {/* Profile Completion Alert */}
                {!isProfileComplete && (
                    <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">⚠️</span>
                            <div>
                                <p className="text-amber-300 font-medium">Complete your profile</p>
                                <p className="text-amber-300/70 text-sm">Add your details and photos to apply for casting calls</p>
                            </div>
                        </div>
                        <Link href="/actor/profile" className="btn btn-accent">
                            Complete Profile
                        </Link>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="card">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                <span className="text-xl">📝</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{totalApplications || 0}</p>
                                <p className="text-neutral-500 text-sm">Applications</p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                <span className="text-xl">⭐</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{shortlisted || 0}</p>
                                <p className="text-neutral-500 text-sm">Shortlisted</p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                <span className="text-xl">🎉</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{selected || 0}</p>
                                <p className="text-neutral-500 text-sm">Selected</p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                <span className="text-xl">🔔</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{notifications?.length || 0}</p>
                                <p className="text-neutral-500 text-sm">New Notifications</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Recent Applications */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-white">Recent Applications</h2>
                            <Link href="/actor/applications" className="text-primary-400 hover:text-primary-300 text-sm">
                                View all →
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {applications && applications.length > 0 ? (
                                applications.map((app) => (
                                    <div key={app.id} className="card card-hover">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold text-white">{app.casting_call?.title}</h3>
                                                <p className="text-neutral-500 text-sm mt-1">
                                                    Applied {new Date(app.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className={`badge badge-${app.status}`}>
                                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="card text-center py-12">
                                    <span className="text-4xl mb-4 block">🎬</span>
                                    <h3 className="text-lg font-medium text-white mb-2">No applications yet</h3>
                                    <p className="text-neutral-500 mb-4">Start browsing casting calls to find your next role</p>
                                    <Link href="/actor/casting-calls" className="btn btn-primary">
                                        Browse Casting Calls
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notifications */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-white">Notifications</h2>
                        </div>

                        <div className="space-y-3">
                            {notifications && notifications.length > 0 ? (
                                notifications.map((notif) => (
                                    <div key={notif.id} className="card p-4">
                                        <div className="flex gap-3">
                                            <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0"></div>
                                            <div>
                                                <p className="text-white text-sm font-medium">{notif.title}</p>
                                                <p className="text-neutral-500 text-xs mt-1">{notif.message}</p>
                                                <p className="text-neutral-600 text-xs mt-2">
                                                    {new Date(notif.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="card text-center py-8">
                                    <span className="text-2xl mb-2 block">🔔</span>
                                    <p className="text-neutral-500 text-sm">No new notifications</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/actor/casting-calls" className="card card-hover flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center group-hover:bg-primary-500/30 transition-colors">
                            <span className="text-xl">🔍</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Browse Casting Calls</h3>
                            <p className="text-neutral-500 text-sm">Find roles that match you</p>
                        </div>
                    </Link>

                    <Link href="/actor/profile" className="card card-hover flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                            <span className="text-xl">👤</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Edit Profile</h3>
                            <p className="text-neutral-500 text-sm">Update your details & photos</p>
                        </div>
                    </Link>

                    <Link href="/actor/applications" className="card card-hover flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
                            <span className="text-xl">📋</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">My Applications</h3>
                            <p className="text-neutral-500 text-sm">Track your submissions</p>
                        </div>
                    </Link>
                </div>
            </main>
        </div>
    );
}
