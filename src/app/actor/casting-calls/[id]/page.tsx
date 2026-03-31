import Link from 'next/link';
import { redirect } from 'next/navigation';
import { DashboardNav } from '@/components/DashboardNav';
import { ProgressChecklist } from '@/components/ProgressChecklist';
import { StatusBadge } from '@/components/StatusBadge';
import { computeActorFit, getActorProfileChecklist, getTrustSummary } from '@/lib/workflows';
import { requireRole } from '@/lib/session';
import { prisma } from '@/lib/prisma';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function CastingCallDetailPage({ params }: PageProps) {
    const { id } = await params;
    const user = await requireRole('actor');
    const actorProfile = await prisma.actorProfile.findUnique({
        where: { userId: user.id },
        include: { images: true },
    });

    const castingCall = await prisma.castingCall.findUnique({
        where: { id },
        include: { castingProfile: true },
    });

    if (!castingCall) {
        redirect('/actor/casting-calls');
    }

    const existingApplication = actorProfile
        ? await prisma.application.findUnique({
              where: {
                  castingCallId_actorId: {
                      castingCallId: id,
                      actorId: actorProfile.id,
                  },
              },
          })
        : null;

    const requirements = (castingCall.requirements || {}) as Record<string, any>;
    const readiness = getActorProfileChecklist(
        actorProfile
            ? {
                  ...actorProfile,
                  user_id: actorProfile.userId,
                  past_works: actorProfile.pastWorks as any[],
              }
            : null,
        (actorProfile?.images || []).map((image) => ({ ...image, actor_id: image.actorId, image_url: image.imageUrl }))
    );
    const fit = computeActorFit(
        actorProfile
            ? {
                  ...actorProfile,
                  user_id: actorProfile.userId,
                  past_works: actorProfile.pastWorks as any[],
              }
            : null,
        {
            ...castingCall,
            requirements: (castingCall.requirements || {}) as any,
            caster_id: castingCall.casterId,
            sample_script_url: castingCall.sampleScriptUrl,
            voice_note_url: castingCall.voiceNoteUrl,
            project_type: castingCall.projectType,
            shoot_location: castingCall.shootLocation,
            compensation_details: castingCall.compensationDetails,
            audition_instructions: castingCall.auditionInstructions,
            submission_checklist: castingCall.submissionChecklist,
        } as any
    );
    const trust = getTrustSummary(castingCall.castingProfile as any);

    return (
        <div className="page-shell">
            <DashboardNav role="actor" userName={user.fullName || 'Actor'} />

            <main className="page-container py-8">
                <Link href="/actor/casting-calls" className="btn btn-ghost px-0">
                    Back to open calls
                </Link>

                <div className="mt-6 grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
                    <section className="space-y-8">
                        <div className="card">
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="badge badge-neutral">{castingCall.projectType || 'Open project'}</span>
                                        {castingCall.castingProfile?.verified ? <span className="badge badge-success">Verified team</span> : null}
                                    </div>
                                    <h1 className="mt-4 font-[var(--font-serif)] text-5xl">{castingCall.title}</h1>
                                    <p className="mt-3 text-lg text-[var(--muted)]">
                                        {castingCall.castingProfile?.companyName || 'Casting team'}
                                    </p>
                                </div>

                                <div className="rounded-[1.5rem] border border-white/8 bg-white/3 p-5 lg:max-w-xs">
                                    <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Your current fit</p>
                                    <p className="mt-2 text-4xl font-semibold">{fit.score}%</p>
                                    <div className="mt-3 space-y-2 text-sm text-[var(--muted)]">
                                        {fit.reasons.length ? fit.reasons.map((reason) => <p key={reason}>• {reason}</p>) : <p>Complete more of your profile to improve signal strength.</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 grid gap-4 md:grid-cols-3">
                                <div className="metric">
                                    <p className="metric-label">Review style</p>
                                    <p className="metric-value text-2xl">{castingCall.deadline ? 'Deadline-based' : 'Rolling'}</p>
                                    <p className="metric-note">
                                        {castingCall.deadline ? new Date(castingCall.deadline).toLocaleDateString() : 'Applications reviewed as they come in.'}
                                    </p>
                                </div>
                                <div className="metric">
                                    <p className="metric-label">Shoot location</p>
                                    <p className="metric-value text-2xl">{castingCall.shootLocation || 'Not listed'}</p>
                                    <p className="metric-note">Travel expectations should be confirmed before final selection.</p>
                                </div>
                                <div className="metric">
                                    <p className="metric-label">Compensation</p>
                                    <p className="metric-value text-2xl">{castingCall.compensationDetails || 'Shared later'}</p>
                                    <p className="metric-note">Protected details can be clarified if you are shortlisted.</p>
                                </div>
                            </div>

                            <div className="divider my-8" />

                            <div>
                                <p className="section-label">Role brief</p>
                                <p className="mt-4 whitespace-pre-wrap text-base leading-8 text-[var(--text)]">
                                    {castingCall.description || 'No role summary has been provided yet.'}
                                </p>
                            </div>

                            <div className="mt-8 grid gap-4 md:grid-cols-2">
                                {requirements.age_range ? (
                                    <div className="surface-soft p-5">
                                        <p className="section-label">Age range</p>
                                        <p className="mt-3 text-lg text-[var(--text)]">
                                            {String(requirements.age_range.min)} to {String(requirements.age_range.max)}
                                        </p>
                                    </div>
                                ) : null}
                                {requirements.gender ? (
                                    <div className="surface-soft p-5">
                                        <p className="section-label">Gender preference</p>
                                        <p className="mt-3 text-lg text-[var(--text)]">
                                            {Array.isArray(requirements.gender) ? requirements.gender.join(', ') : String(requirements.gender)}
                                        </p>
                                    </div>
                                ) : null}
                                {requirements.languages ? (
                                    <div className="surface-soft p-5">
                                        <p className="section-label">Languages</p>
                                        <p className="mt-3 text-lg text-[var(--text)]">
                                            {Array.isArray(requirements.languages) ? requirements.languages.join(', ') : String(requirements.languages)}
                                        </p>
                                    </div>
                                ) : null}
                                {requirements.location ? (
                                    <div className="surface-soft p-5">
                                        <p className="section-label">Preferred region</p>
                                        <p className="mt-3 text-lg text-[var(--text)]">{String(requirements.location)}</p>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </section>

                    <aside className="space-y-8">
                        <div className="card">
                            <p className="section-label">Submission status</p>
                            <div className="mt-4">
                                {existingApplication ? (
                                    <>
                                        <StatusBadge status={existingApplication.status as any} />
                                        <p className="mt-3 text-sm text-[var(--muted)]">
                                            Submitted on {new Date(existingApplication.createdAt).toLocaleDateString()}.
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-sm text-[var(--muted)]">
                                        You have not applied yet. Use the readiness and checklist below to judge whether now is the right time.
                                    </p>
                                )}
                            </div>

                            <div className="mt-6 space-y-3">
                                {castingCall.submissionChecklist?.length ? (
                                    castingCall.submissionChecklist.map((item) => (
                                        <div key={item} className="rounded-[1.25rem] border border-white/8 bg-white/3 px-4 py-3 text-sm text-[var(--text)]">
                                            {item}
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-[1.25rem] border border-white/8 bg-white/3 px-4 py-3 text-sm text-[var(--muted)]">
                                        No explicit checklist supplied. Share a strong message and a reliable audition link.
                                    </div>
                                )}
                            </div>

                            {!existingApplication && castingCall.isActive ? (
                                <Link
                                    href={`/actor/casting-calls/${id}/apply`}
                                    className={`mt-6 btn w-full ${readiness.readyToApply ? 'btn-primary' : 'btn-secondary'}`}
                                >
                                    {readiness.readyToApply ? 'Start your submission' : 'Apply anyway with current profile'}
                                </Link>
                            ) : null}
                        </div>

                        <ProgressChecklist
                            title="Your submission readiness"
                            percent={readiness.percent}
                            items={readiness.checks}
                            note="A stronger profile improves both fit confidence and review speed."
                        />

                        <div className="card">
                            <p className="section-label">Trust cues</p>
                            <h2 className="mt-3 panel-title">Before you share an audition</h2>
                            <div className="mt-5 space-y-3">
                                {trust.cues.map((cue) => (
                                    <div key={cue} className="rounded-[1.25rem] border border-white/8 bg-white/3 px-4 py-3 text-sm text-[var(--text)]">
                                        {cue}
                                    </div>
                                ))}
                            </div>
                            {castingCall.castingProfile?.trustNote ? (
                                <p className="mt-4 text-sm text-[var(--muted)]">{castingCall.castingProfile.trustNote}</p>
                            ) : null}
                            {castingCall.castingProfile?.website ? (
                                <a
                                    href={castingCall.castingProfile.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-5 inline-flex text-sm text-[var(--accent)]"
                                >
                                    Visit company website
                                </a>
                            ) : null}
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
