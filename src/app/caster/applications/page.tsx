'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { DashboardNav } from '@/components/DashboardNav';
import type { Application, ApplicationStatus } from '@/types';

interface ApplicationWithDetails extends Omit<Application, 'casting_call' | 'actor_profile'> {
    actor_profile?: {
        id: string;
        age: number;
        gender: string;
        bio: string;
        profile?: {
            full_name: string;
            email: string;
            phone: string;
        };
        images?: { type: string; image_url: string }[];
    };
    casting_call?: {
        title: string;
    };
}

export default function CasterApplicationsPage() {
    const [profile, setProfile] = useState<{ full_name: string } | null>(null);
    const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState<ApplicationWithDetails | null>(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();

        setProfile(profileData);

        const { data: casterProfile } = await supabase
            .from('casting_profiles')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (!casterProfile) return;

        // Get all casting calls for this caster
        const { data: calls } = await supabase
            .from('casting_calls')
            .select('id')
            .eq('caster_id', casterProfile.id);

        const callIds = calls?.map(c => c.id) || [];

        if (callIds.length === 0) {
            setLoading(false);
            return;
        }

        // Get applications with actor details
        const { data: apps } = await supabase
            .from('applications')
            .select(`
        *,
        casting_call:casting_calls(title),
        actor_profile:actor_profiles(
          id,
          age,
          gender,
          bio,
          profile:profiles(full_name, email, phone),
          images:actor_images(type, image_url)
        )
      `)
            .in('casting_call_id', callIds)
            .order('created_at', { ascending: false });

        setApplications(apps || []);
        setLoading(false);
    };

    const updateStatus = async (appId: string, status: ApplicationStatus) => {
        setUpdating(true);
        const supabase = createClient();

        await supabase
            .from('applications')
            .update({ status })
            .eq('id', appId);

        // Update local state
        setApplications(prev =>
            prev.map(app =>
                app.id === appId ? { ...app, status } : app
            )
        );

        if (selectedApp?.id === appId) {
            setSelectedApp(prev => prev ? { ...prev, status } : null);
        }

        setUpdating(false);
    };

    const getStatusActions = (currentStatus: ApplicationStatus) => {
        const actions: { status: ApplicationStatus; label: string; color: string }[] = [];

        if (currentStatus === 'applied') {
            actions.push({ status: 'shortlisted', label: 'Shortlist', color: 'amber' });
            actions.push({ status: 'rejected', label: 'Reject', color: 'red' });
        } else if (currentStatus === 'shortlisted') {
            actions.push({ status: 'selected', label: 'Select', color: 'emerald' });
            actions.push({ status: 'rejected', label: 'Reject', color: 'red' });
        }

        return actions;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    const centerImage = (images: { type: string; image_url: string }[] | undefined) =>
        images?.find(img => img.type === 'center')?.image_url;

    return (
        <div className="min-h-screen bg-neutral-950">
            <DashboardNav role="caster" userName={profile?.full_name || 'Caster'} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-white mb-2">Applications</h1>
                <p className="text-neutral-400 mb-8">Review actor submissions for your casting calls</p>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Applications List */}
                    <div className="lg:col-span-2">
                        {applications.length > 0 ? (
                            <div className="space-y-4">
                                {applications.map((app) => (
                                    <div
                                        key={app.id}
                                        onClick={() => setSelectedApp(app)}
                                        className={`card cursor-pointer transition-all ${selectedApp?.id === app.id
                                            ? 'border-primary-500 ring-1 ring-primary-500'
                                            : 'card-hover'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Avatar */}
                                            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-800 flex-shrink-0">
                                                {centerImage(app.actor_profile?.images) ? (
                                                    <Image
                                                        src={centerImage(app.actor_profile?.images)!}
                                                        alt=""
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-2xl">
                                                        👤
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-grow min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-white truncate">
                                                        {app.actor_profile?.profile?.full_name || 'Actor'}
                                                    </h3>
                                                    <span className={`badge badge-${app.status} text-xs`}>
                                                        {app.status}
                                                    </span>
                                                </div>
                                                <p className="text-neutral-500 text-sm">
                                                    For: {app.casting_call?.title}
                                                </p>
                                                <p className="text-neutral-600 text-xs mt-1">
                                                    {app.actor_profile?.age && `${app.actor_profile.age}y`}
                                                    {app.actor_profile?.gender && ` • ${app.actor_profile.gender}`}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                {getStatusActions(app.status).map((action) => (
                                                    <button
                                                        key={action.status}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            updateStatus(app.id, action.status);
                                                        }}
                                                        disabled={updating}
                                                        className={`btn btn-ghost text-xs py-1 px-3 text-${action.color}-400 hover:bg-${action.color}-500/10`}
                                                    >
                                                        {action.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="card text-center py-16">
                                <span className="text-5xl mb-4 block">📋</span>
                                <h3 className="text-xl font-medium text-white mb-2">No applications yet</h3>
                                <p className="text-neutral-500">Applications will appear here when actors apply</p>
                            </div>
                        )}
                    </div>

                    {/* Actor Detail Panel */}
                    <div className="lg:col-span-1">
                        {selectedApp ? (
                            <div className="card sticky top-24">
                                <h2 className="text-lg font-semibold text-white mb-4">Actor Details</h2>

                                {/* Images */}
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    {['left', 'center', 'right'].map((type) => {
                                        const img = selectedApp.actor_profile?.images?.find(i => i.type === type);
                                        return (
                                            <div key={type} className="relative aspect-square rounded-lg overflow-hidden bg-neutral-800">
                                                {img ? (
                                                    <Image src={img.image_url} alt={type} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs">
                                                        No {type}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Basic Info */}
                                <div className="space-y-3 mb-4">
                                    <div>
                                        <p className="text-neutral-500 text-xs">Name</p>
                                        <p className="text-white font-medium">{selectedApp.actor_profile?.profile?.full_name}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-neutral-500 text-xs">Age</p>
                                            <p className="text-white">{selectedApp.actor_profile?.age || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-neutral-500 text-xs">Gender</p>
                                            <p className="text-white">{selectedApp.actor_profile?.gender || '-'}</p>
                                        </div>
                                    </div>
                                    {selectedApp.actor_profile?.bio && (
                                        <div>
                                            <p className="text-neutral-500 text-xs">Bio</p>
                                            <p className="text-neutral-300 text-sm">{selectedApp.actor_profile.bio}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Video */}
                                {selectedApp.audition_video_url && (
                                    <div className="mb-4">
                                        <p className="text-neutral-500 text-xs mb-2">Audition Video</p>
                                        <a
                                            href={selectedApp.audition_video_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-secondary w-full"
                                        >
                                            🎬 Watch Video
                                        </a>
                                    </div>
                                )}

                                {/* Contact Info (only if selected) */}
                                {selectedApp.status === 'selected' && (
                                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                                        <p className="text-emerald-300 text-xs font-medium mb-2">Contact Information</p>
                                        <p className="text-white text-sm">{selectedApp.actor_profile?.profile?.email}</p>
                                        {selectedApp.actor_profile?.profile?.phone && (
                                            <p className="text-white text-sm">{selectedApp.actor_profile.profile.phone}</p>
                                        )}
                                    </div>
                                )}

                                {/* Status Actions */}
                                <div className="mt-4 flex gap-2">
                                    {getStatusActions(selectedApp.status).map((action) => (
                                        <button
                                            key={action.status}
                                            onClick={() => updateStatus(selectedApp.id, action.status)}
                                            disabled={updating}
                                            className={`btn flex-1 ${action.color === 'emerald' ? 'btn-primary' :
                                                action.color === 'amber' ? 'btn-accent' :
                                                    'btn-secondary text-red-400'
                                                }`}
                                        >
                                            {action.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="card text-center py-12 text-neutral-500">
                                <span className="text-3xl mb-2 block">👆</span>
                                <p className="text-sm">Select an application to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
