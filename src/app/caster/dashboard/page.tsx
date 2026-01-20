import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { DashboardNav } from '@/components/DashboardNav';

export default async function CasterDashboard() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth/login');

    // Fetch caster data
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .eq('id', user.id)
        .single();

    if (profile && profile.role !== 'caster') {
        redirect('/actor/dashboard');
    }

    const { data: casterProfile } = await supabase
        .from('casting_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

    const { data: castingCalls } = await supabase
        .from('casting_calls')
        .select('*')
        .eq('caster_id', casterProfile?.id)
        .order('created_at', { ascending: false })
        .limit(5);

    // Get all casting call IDs for this caster
    const callIds = castingCalls?.map(c => c.id) || [];

    const { data: recentApplications } = callIds.length > 0 ? await supabase
        .from('applications')
        .select(`
      *,
      actor_profile:actor_profiles(
        id,
        user_id,
        age,
        gender,
        profile:profiles(full_name)
      ),
      casting_call:casting_calls(title)
    `)
        .in('casting_call_id', callIds)
        .order('created_at', { ascending: false })
        .limit(5) : { data: [] };

    // Stats
    const { count: totalCalls } = await supabase
        .from('casting_calls')
        .select('*', { count: 'exact', head: true })
        .eq('caster_id', casterProfile?.id);

    const { count: activeCalls } = await supabase
        .from('casting_calls')
        .select('*', { count: 'exact', head: true })
        .eq('caster_id', casterProfile?.id)
        .eq('is_active', true);

    const { count: totalApplications } = callIds.length > 0 ? await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .in('casting_call_id', callIds) : { count: 0 };

    const { count: pendingApplications } = callIds.length > 0 ? await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .in('casting_call_id', callIds)
        .eq('status', 'applied') : { count: 0 };

    return (
        <div className="min-h-screen bg-neutral-950">
            <DashboardNav role="caster" userName={profile?.full_name || casterProfile?.company_name || 'Caster'} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Welcome, {casterProfile?.company_name || profile?.full_name?.split(' ')[0]}! 🎬
                    </h1>
                    <p className="text-neutral-400">Discover talented actors for your productions</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="card">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                                <span className="text-xl">📢</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{totalCalls || 0}</p>
                                <p className="text-neutral-500 text-sm">Total Calls</p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                <span className="text-xl">✅</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{activeCalls || 0}</p>
                                <p className="text-neutral-500 text-sm">Active Calls</p>
                            </div>
                        </div>
                    </div>

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
                                <span className="text-xl">⏳</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{pendingApplications || 0}</p>
                                <p className="text-neutral-500 text-sm">Pending Review</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Recent Applications */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-white">Recent Applications</h2>
                            <Link href="/caster/applications" className="text-primary-400 hover:text-primary-300 text-sm">
                                View all →
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {recentApplications && recentApplications.length > 0 ? (
                                recentApplications.map((app) => (
                                    <div key={app.id} className="card card-hover">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="avatar w-12 h-12">
                                                    {app.actor_profile?.profile?.full_name?.charAt(0) || 'A'}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-white">
                                                        {app.actor_profile?.profile?.full_name || 'Actor'}
                                                    </h3>
                                                    <p className="text-neutral-500 text-sm">
                                                        Applied for: {app.casting_call?.title} • {app.actor_profile?.age && `${app.actor_profile.age}y`} {app.actor_profile?.gender}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`badge badge-${app.status}`}>
                                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="card text-center py-12">
                                    <span className="text-4xl mb-4 block">📋</span>
                                    <h3 className="text-lg font-medium text-white mb-2">No applications yet</h3>
                                    <p className="text-neutral-500 mb-4">Create a casting call to start receiving applications</p>
                                    <Link href="/caster/create-call" className="btn btn-primary">
                                        Create Casting Call
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Your Casting Calls */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-white">Your Calls</h2>
                            <Link href="/caster/calls" className="text-primary-400 hover:text-primary-300 text-sm">
                                Manage →
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {castingCalls && castingCalls.length > 0 ? (
                                castingCalls.map((call) => (
                                    <div key={call.id} className="card p-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="font-medium text-white text-sm">{call.title}</h3>
                                                <p className="text-neutral-500 text-xs mt-1">
                                                    {new Date(call.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className={`badge ${call.is_active ? 'badge-success' : 'badge-warning'} text-xs`}>
                                                {call.is_active ? 'Active' : 'Closed'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="card text-center py-8">
                                    <span className="text-2xl mb-2 block">📢</span>
                                    <p className="text-neutral-500 text-sm">No casting calls yet</p>
                                </div>
                            )}

                            <Link
                                href="/caster/create-call"
                                className="block p-4 rounded-xl border-2 border-dashed border-neutral-700 text-center hover:border-primary-500/50 hover:bg-primary-500/5 transition-colors"
                            >
                                <span className="text-2xl block mb-1">➕</span>
                                <span className="text-neutral-400 text-sm">Create New Call</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/caster/create-call" className="card card-hover flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center group-hover:bg-primary-500/30 transition-colors">
                            <span className="text-xl">➕</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Create Casting Call</h3>
                            <p className="text-neutral-500 text-sm">Post a new role opening</p>
                        </div>
                    </Link>

                    <Link href="/caster/applications" className="card card-hover flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                            <span className="text-xl">👁️</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Review Applications</h3>
                            <p className="text-neutral-500 text-sm">View actor submissions</p>
                        </div>
                    </Link>

                    <Link href="/caster/calls" className="card card-hover flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
                            <span className="text-xl">📋</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Manage Calls</h3>
                            <p className="text-neutral-500 text-sm">Edit or close your calls</p>
                        </div>
                    </Link>
                </div>
            </main>
        </div>
    );
}
