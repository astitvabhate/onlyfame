'use client';

import { use, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardNav } from '@/components/DashboardNav';
import { ProgressChecklist } from '@/components/ProgressChecklist';
import { getActorProfileChecklist } from '@/lib/workflows';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function ApplyToCastingCallPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();

    const [profile, setProfile] = useState<{ full_name: string } | null>(null);
    const [actorProfile, setActorProfile] = useState<any>(null);
    const [actorImages, setActorImages] = useState<{ type: 'left' | 'center' | 'right' }[]>([]);
    const [castingCall, setCastingCall] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [alreadyApplied, setAlreadyApplied] = useState(false);

    const [coverLetter, setCoverLetter] = useState('');
    const [videoUrl, setVideoUrl] = useState('');

    useEffect(() => {
        loadData();
    }, [id]);

    const readiness = useMemo(() => getActorProfileChecklist(actorProfile, actorImages), [actorProfile, actorImages]);

    const loadData = async () => {
        const [profileResponse, actorResponse, callResponse, applicationsResponse] = await Promise.all([
            fetch('/api/actor/profile'),
            fetch('/api/actor/profile'),
            fetch(`/api/public/casting-calls/${id}`),
            fetch('/api/actor/applications'),
        ]);

        if (!profileResponse.ok || !callResponse.ok) {
            router.push('/actor/casting-calls');
            return;
        }

        const profilePayload = await profileResponse.json();
        const callPayload = await callResponse.json();
        const applicationsPayload = applicationsResponse.ok ? await applicationsResponse.json() : { applications: [] };

        const actorData = profilePayload.actorProfile
            ? {
                  ...profilePayload.actorProfile,
                  user_id: profilePayload.actorProfile.userId,
                  past_works: profilePayload.actorProfile.pastWorks || [],
              }
            : null;
        setProfile({ full_name: profilePayload.profile.fullName });
        setActorProfile(actorData);
        setCastingCall(callPayload.castingCall);
        setActorImages((profilePayload.images || []).map((image: any) => ({ type: image.type })));
        setAlreadyApplied((applicationsPayload.applications || []).some((app: any) => app.castingCallId === id));
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!actorProfile) {
            setError('Your actor profile is missing. Complete setup first.');
            return;
        }
        if (!videoUrl.trim()) {
            setError('Add an audition link so the casting team can review your work.');
            return;
        }

        setSubmitting(true);
        setError('');

        const response = await fetch('/api/applications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                castingCallId: id,
                notes: coverLetter || null,
                auditionVideoUrl: videoUrl.trim(),
            }),
        });
        const payload = await response.json();
        if (!response.ok) {
            setError(payload.error || 'Submission failed.');
            setSubmitting(false);
            return;
        }

        router.push('/actor/applications');
    };

    if (loading) {
        return <div className="page-shell flex items-center justify-center text-[var(--text)]">Preparing submission...</div>;
    }

    if (alreadyApplied) {
        return (
            <div className="page-shell">
                <DashboardNav role="actor" userName={profile?.full_name || 'Actor'} />
                <main className="page-container py-16">
                    <div className="mx-auto max-w-2xl card text-center">
                        <p className="section-label">Submission status</p>
                        <h1 className="mt-3 font-[var(--font-serif)] text-4xl">You have already applied to this role</h1>
                        <p className="mt-4 text-[var(--muted)]">
                            Review your audition timeline from the applications workspace.
                        </p>
                        <Link href="/actor/applications" className="btn btn-primary mt-8">
                            View my auditions
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="page-shell">
            <DashboardNav role="actor" userName={profile?.full_name || 'Actor'} />

            <main className="page-container py-8">
                <Link href={`/actor/casting-calls/${id}`} className="btn btn-ghost px-0">
                    Back to role details
                </Link>

                <div className="mt-6 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
                    <form onSubmit={handleSubmit} className="card">
                        <p className="section-label">Audition submission</p>
                        <h1 className="mt-3 font-[var(--font-serif)] text-4xl">Submit for {castingCall?.title}</h1>
                        <p className="mt-3 text-[var(--muted)]">
                            {castingCall?.casting_profile?.company_name || 'Casting team'}{castingCall?.casting_profile?.verified ? ' · verified casting identity' : ''}
                        </p>

                        {error ? (
                            <div className="mt-6 rounded-[1.5rem] border border-[rgba(214,106,94,0.3)] bg-[rgba(214,106,94,0.1)] px-4 py-3 text-sm text-[#efb3ac]">
                                {error}
                            </div>
                        ) : null}

                        <div className="mt-8 space-y-5">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[var(--text)]">
                                    Why you fit this role
                                </label>
                                <textarea
                                    value={coverLetter}
                                    onChange={(e) => setCoverLetter(e.target.value)}
                                    className="textarea"
                                    placeholder="Keep it specific: your type, language strengths, availability, and why this brief fits your profile."
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-[var(--text)]">
                                    Audition video link
                                </label>
                                <input
                                    type="url"
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                    className="input"
                                    placeholder="https://youtube.com/... or a secure Drive/Vimeo link"
                                    required
                                />
                                <p className="mt-2 text-xs text-[var(--muted)]">
                                    Use a link that casting teams can open without requesting permission.
                                </p>
                            </div>
                        </div>

                        {castingCall?.audition_instructions ? (
                            <div className="mt-8 rounded-[1.5rem] border border-white/8 bg-white/3 p-5">
                                <p className="section-label">Casting instructions</p>
                                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--text)]">
                                    {castingCall.audition_instructions}
                                </p>
                            </div>
                        ) : null}

                        <div className="mt-8 flex items-center justify-between gap-4">
                            <p className="max-w-md text-sm text-[var(--muted)]">
                                Your contact information stays protected until the team moves you to a selected state.
                            </p>
                            <button type="submit" disabled={submitting} className="btn btn-primary">
                                {submitting ? 'Submitting...' : 'Send audition'}
                            </button>
                        </div>
                    </form>

                    <aside className="space-y-8">
                        <ProgressChecklist
                            title="Profile readiness before submission"
                            percent={readiness.percent}
                            items={readiness.checks}
                            note="You can still submit now, but stronger readiness improves review confidence."
                        />

                        <div className="card">
                            <p className="section-label">Submission notes</p>
                            <h2 className="mt-3 panel-title">Before you hit send</h2>
                            <div className="mt-5 space-y-3">
                                {(castingCall?.submission_checklist?.length
                                    ? castingCall.submission_checklist
                                    : [
                                          'Use a working video link with visible performance.',
                                          'Keep your message focused on fit, language, and availability.',
                                          'Review your profile for missing bio, languages, or headshots.',
                                      ]
                                ).map((item: string) => (
                                    <div key={item} className="rounded-[1.25rem] border border-white/8 bg-white/3 px-4 py-3 text-sm text-[var(--text)]">
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
