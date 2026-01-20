import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { DashboardNav } from '@/components/DashboardNav';

export default async function CasterCallsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    const { data: casterProfile } = await supabase
        .from('casting_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

    const { data: castingCalls } = await supabase
        .from('casting_calls')
        .select('*')
        .eq('caster_id', casterProfile?.id)
        .order('created_at', { ascending: false });

    // Get application counts for each call
    const callIds = castingCalls?.map(c => c.id) || [];
    const { data: applicationCounts } = callIds.length > 0
        ? await supabase
            .from('applications')
            .select('casting_call_id')
            .in('casting_call_id', callIds)
        : { data: [] };

    const countsMap = (applicationCounts || []).reduce((acc, app) => {
        acc[app.casting_call_id] = (acc[app.casting_call_id] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="min-h-screen bg-neutral-950">
            <DashboardNav role="caster" userName={profile?.full_name || casterProfile?.company_name || 'Caster'} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">My Casting Calls</h1>
                        <p className="text-neutral-400">Manage your role postings</p>
                    </div>
                    <Link href="/caster/create-call" className="btn btn-primary">
                        <span>➕</span> Create New Call
                    </Link>
                </div>

                {/* Calls List */}
                {castingCalls && castingCalls.length > 0 ? (
                    <div className="space-y-4">
                        {castingCalls.map((call) => (
                            <div key={call.id} className="card card-hover">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-white text-lg">{call.title}</h3>
                                            <span className={`badge ${call.is_active ? 'badge-success' : 'badge-warning'}`}>
                                                {call.is_active ? 'Active' : 'Closed'}
                                            </span>
                                        </div>
                                        <p className="text-neutral-400 text-sm line-clamp-2 mb-3">
                                            {call.description || 'No description'}
                                        </p>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="text-neutral-500">
                                                Posted {new Date(call.created_at).toLocaleDateString()}
                                            </span>
                                            {call.deadline && (
                                                <span className="text-neutral-500">
                                                    Deadline: {new Date(call.deadline).toLocaleDateString()}
                                                </span>
                                            )}
                                            <span className="text-primary-400">
                                                {countsMap[call.id] || 0} applications
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/caster/applications?call=${call.id}`}
                                            className="btn btn-secondary text-sm py-2"
                                        >
                                            View Applications
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card text-center py-16">
                        <span className="text-5xl mb-4 block">📢</span>
                        <h3 className="text-xl font-medium text-white mb-2">No casting calls yet</h3>
                        <p className="text-neutral-500 mb-6">Create your first casting call to start discovering talent</p>
                        <Link href="/caster/create-call" className="btn btn-primary">
                            Create Casting Call
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
