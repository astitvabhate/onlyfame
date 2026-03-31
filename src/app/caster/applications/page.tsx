'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardNav } from '@/components/DashboardNav';
import { StatusBadge } from '@/components/StatusBadge';
import type { ApplicationStatus } from '@/types';

interface ApplicationWithDetails {
    id: string;
    casting_call_id: string;
    audition_video_url: string | null;
    notes: string | null;
    review_notes?: string | null;
    status: ApplicationStatus;
    created_at: string;
    actor_profile?: {
        id: string;
        age: number | null;
        gender: string | null;
        location?: string | null;
        bio: string | null;
        profile?: {
            full_name: string;
            email: string;
            phone: string | null;
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
    const [reviewNotes, setReviewNotes] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        setReviewNotes(selectedApp?.review_notes || '');
    }, [selectedApp]);

    const statusCounts = useMemo(
        () => ({
            applied: applications.filter((app) => app.status === 'applied').length,
            shortlisted: applications.filter((app) => app.status === 'shortlisted').length,
            selected: applications.filter((app) => app.status === 'selected').length,
            rejected: applications.filter((app) => app.status === 'rejected').length,
        }),
        [applications]
    );

    const loadData = async () => {
        const [profileResponse, applicationsResponse] = await Promise.all([
            fetch('/api/caster/profile'),
            fetch('/api/caster/applications'),
        ]);

        if (!profileResponse.ok || !applicationsResponse.ok) {
            setLoading(false);
            return;
        }

        const profilePayload = await profileResponse.json();
        const applicationsPayload = await applicationsResponse.json();

        const apps = (applicationsPayload.applications || []).map((application: any) => ({
            id: application.id,
            casting_call_id: application.castingCallId,
            audition_video_url: application.auditionVideoUrl,
            notes: application.notes,
            review_notes: application.reviewNotes,
            status: application.status,
            created_at: application.createdAt,
            actor_profile: application.actorProfile
                ? {
                      id: application.actorProfile.id,
                      age: application.actorProfile.age,
                      gender: application.actorProfile.gender,
                      location: application.actorProfile.location,
                      bio: application.actorProfile.bio,
                      profile: {
                          full_name: application.actorProfile.user.fullName,
                          email: application.actorProfile.user.email,
                          phone: application.actorProfile.user.phone,
                      },
                      images: (application.actorProfile.images || []).map((image: any) => ({
                          type: image.type,
                          image_url: image.imageUrl,
                      })),
                  }
                : undefined,
            casting_call: application.castingCall
                ? {
                      title: application.castingCall.title,
                  }
                : undefined,
        }));

        setProfile({ full_name: profilePayload.profile.fullName });
        setApplications(apps as ApplicationWithDetails[]);
        setSelectedApp((apps[0] as ApplicationWithDetails) || null);
        setLoading(false);
    };

    const updateApplication = async (appId: string, updates: Partial<ApplicationWithDetails>) => {
        setUpdating(true);
        await fetch('/api/caster/applications', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: appId,
                status: updates.status,
                reviewNotes: updates.review_notes,
            }),
        });

        setApplications((prev) =>
            prev.map((app) => (app.id === appId ? { ...app, ...updates } : app))
        );
        setSelectedApp((prev) => (prev?.id === appId ? { ...prev, ...updates } : prev));
        setUpdating(false);
    };

    const getActions = (status: ApplicationStatus) => {
        if (status === 'applied') return ['shortlisted', 'rejected'] as ApplicationStatus[];
        if (status === 'shortlisted') return ['selected', 'rejected'] as ApplicationStatus[];
        return [];
    };

    const centerImage = selectedApp?.actor_profile?.images?.find((image) => image.type === 'center')?.image_url;

    if (loading) {
        return <div className="page-shell flex items-center justify-center text-[var(--text)]">Loading review workspace...</div>;
    }

    return (
        <div className="page-shell">
            <DashboardNav role="caster" userName={profile?.full_name || 'Caster'} />

            <main className="page-container py-8">
                <div className="card">
                    <p className="section-label">Application review</p>
                    <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <h1 className="font-[var(--font-serif)] text-4xl">Review auditions with profile context and clear status controls</h1>
                            <p className="mt-3 max-w-2xl text-[var(--muted)]">
                                Move applicants through the pipeline without losing sight of their material, location, or contact privacy rules.
                            </p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="metric">
                                <p className="metric-label">New</p>
                                <p className="metric-value">{statusCounts.applied}</p>
                            </div>
                            <div className="metric">
                                <p className="metric-label">Shortlisted</p>
                                <p className="metric-value">{statusCounts.shortlisted}</p>
                            </div>
                            <div className="metric">
                                <p className="metric-label">Selected</p>
                                <p className="metric-value">{statusCounts.selected}</p>
                            </div>
                            <div className="metric">
                                <p className="metric-label">Rejected</p>
                                <p className="metric-value">{statusCounts.rejected}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
                    <section className="space-y-4">
                        {applications.length > 0 ? (
                            applications.map((application) => (
                                <button
                                    key={application.id}
                                    type="button"
                                    onClick={() => setSelectedApp(application)}
                                    className={`card w-full text-left ${selectedApp?.id === application.id ? 'border-[rgba(224,175,86,0.35)]' : ''}`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <p className="text-xl font-semibold text-[var(--text)]">
                                                    {application.actor_profile?.profile?.full_name || 'Actor'}
                                                </p>
                                                <StatusBadge status={application.status} />
                                            </div>
                                            <p className="mt-2 text-sm text-[var(--muted)]">
                                                {application.casting_call?.title} · {application.actor_profile?.location || 'Location not listed'}
                                            </p>
                                        </div>
                                        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                                            {new Date(application.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="card text-[var(--muted)]">No applications yet. Create or promote a casting call to start reviewing talent.</div>
                        )}
                    </section>

                    <aside>
                        {selectedApp ? (
                            <div className="card sticky top-24">
                                <p className="section-label">Applicant detail</p>
                                <div className="mt-4 flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="font-[var(--font-serif)] text-4xl">
                                            {selectedApp.actor_profile?.profile?.full_name || 'Actor'}
                                        </h2>
                                        <p className="mt-2 text-[var(--muted)]">{selectedApp.casting_call?.title}</p>
                                    </div>
                                    <StatusBadge status={selectedApp.status} />
                                </div>

                                <div className="mt-6 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                                    <div className="overflow-hidden rounded-[1.5rem] border border-white/8 bg-white/3">
                                        {centerImage ? (
                                            <img src={centerImage} alt="Actor headshot" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex aspect-[0.78] items-center justify-center text-sm text-[var(--muted)]">No center headshot</div>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <div className="rounded-[1.25rem] border border-white/8 bg-white/3 px-4 py-3 text-sm text-[var(--text)]">
                                            Age: {selectedApp.actor_profile?.age || 'Not listed'}
                                        </div>
                                        <div className="rounded-[1.25rem] border border-white/8 bg-white/3 px-4 py-3 text-sm text-[var(--text)]">
                                            Gender: {selectedApp.actor_profile?.gender || 'Not listed'}
                                        </div>
                                        <div className="rounded-[1.25rem] border border-white/8 bg-white/3 px-4 py-3 text-sm text-[var(--text)]">
                                            Location: {selectedApp.actor_profile?.location || 'Not listed'}
                                        </div>
                                    </div>
                                </div>

                                {selectedApp.actor_profile?.bio ? (
                                    <div className="mt-6 rounded-[1.5rem] border border-white/8 bg-white/3 p-5">
                                        <p className="section-label">Bio</p>
                                        <p className="mt-3 text-sm leading-7 text-[var(--text)]">{selectedApp.actor_profile.bio}</p>
                                    </div>
                                ) : null}

                                {selectedApp.notes ? (
                                    <div className="mt-6 rounded-[1.5rem] border border-white/8 bg-white/3 p-5">
                                        <p className="section-label">Actor note</p>
                                        <p className="mt-3 text-sm leading-7 text-[var(--text)]">{selectedApp.notes}</p>
                                    </div>
                                ) : null}

                                <div className="mt-6">
                                    <label className="mb-2 block text-sm font-medium text-[var(--text)]">Internal review note</label>
                                    <textarea
                                        className="textarea"
                                        value={reviewNotes}
                                        onChange={(e) => setReviewNotes(e.target.value)}
                                        placeholder="Capture fit, concerns, or next-step notes for your team."
                                    />
                                    <button
                                        type="button"
                                        onClick={() => updateApplication(selectedApp.id, { review_notes: reviewNotes })}
                                        disabled={updating}
                                        className="btn btn-secondary mt-3"
                                    >
                                        Save note
                                    </button>
                                </div>

                                <div className="mt-6 flex flex-col gap-3 md:flex-row">
                                    {selectedApp.audition_video_url ? (
                                        <a
                                            href={selectedApp.audition_video_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-primary"
                                        >
                                            Open audition
                                        </a>
                                    ) : (
                                        <span className="btn btn-secondary">No audition link provided</span>
                                    )}

                                    {getActions(selectedApp.status).map((status) => (
                                        <button
                                            key={status}
                                            type="button"
                                            disabled={updating}
                                            onClick={() => updateApplication(selectedApp.id, { status })}
                                            className={`btn ${status === 'selected' ? 'btn-primary' : status === 'shortlisted' ? 'btn-secondary' : 'btn-ghost'}`}
                                        >
                                            {status === 'selected' ? 'Select actor' : status === 'shortlisted' ? 'Shortlist' : 'Reject'}
                                        </button>
                                    ))}
                                </div>

                                {selectedApp.status === 'selected' ? (
                                    <div className="mt-6 rounded-[1.5rem] border border-[rgba(84,176,138,0.3)] bg-[rgba(84,176,138,0.1)] p-5 text-sm text-[#a9e7cb]">
                                        <p className="font-semibold">Contact sharing unlocked</p>
                                        <p className="mt-2">{selectedApp.actor_profile?.profile?.email}</p>
                                        {selectedApp.actor_profile?.profile?.phone ? <p>{selectedApp.actor_profile.profile.phone}</p> : null}
                                    </div>
                                ) : null}
                            </div>
                        ) : (
                            <div className="card text-[var(--muted)]">Select an applicant to open the full review panel.</div>
                        )}
                    </aside>
                </div>
            </main>
        </div>
    );
}
