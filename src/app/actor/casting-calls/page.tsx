import Link from 'next/link';
import { DashboardNav } from '@/components/DashboardNav';
import { computeActorFit, getActorProfileChecklist } from '@/lib/workflows';
import { requireRole } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export default async function CastingCallsPage() {
    const user = await requireRole('actor');
    const actorProfile = await prisma.actorProfile.findUnique({
        where: { userId: user.id },
        include: { images: true },
    });

    const castingCalls = await prisma.castingCall.findMany({
        where: { isActive: true },
        include: { castingProfile: true },
        orderBy: { createdAt: 'desc' },
    });

    const applications = actorProfile
        ? await prisma.application.findMany({
              where: { actorId: actorProfile.id },
              select: { castingCallId: true },
          })
        : [];

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
    const appliedCallIds = new Set(applications.map((application) => application.castingCallId));

    return (
        <div className="page-shell">
            <DashboardNav role="actor" userName={user.fullName || 'Actor'} />

            <main className="page-container py-8">
                <div className="card">
                    <p className="section-label">Open calls</p>
                    <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <h1 className="font-[var(--font-serif)] text-4xl">Discover roles that are ready for serious submissions</h1>
                            <p className="mt-3 max-w-2xl text-[var(--muted)]">
                                Calls are sorted by recency, but the strongest matches stand out through profile fit and trust cues.
                            </p>
                        </div>
                        <div className="rounded-[1.5rem] border border-white/8 bg-white/3 px-5 py-4">
                            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Profile readiness</p>
                            <p className="mt-2 text-3xl font-semibold">{readiness.percent}%</p>
                            <p className="mt-1 text-sm text-[var(--muted)]">
                                {readiness.readyToApply ? 'You are ready to submit now.' : 'Finish setup for the strongest application.'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {castingCalls.length > 0 ? (
                        castingCalls.map((call) => {
                            const hasApplied = appliedCallIds.has(call.id);
                            const fit = computeActorFit(
                                actorProfile
                                    ? {
                                          ...actorProfile,
                                          user_id: actorProfile.userId,
                                          past_works: actorProfile.pastWorks as any[],
                                      }
                                    : null,
                                {
                                    ...call,
                                    requirements: (call.requirements || {}) as any,
                                    caster_id: call.casterId,
                                    sample_script_url: call.sampleScriptUrl,
                                    voice_note_url: call.voiceNoteUrl,
                                    project_type: call.projectType,
                                    shoot_location: call.shootLocation,
                                    compensation_details: call.compensationDetails,
                                    audition_instructions: call.auditionInstructions,
                                    submission_checklist: call.submissionChecklist,
                                } as any
                            );
                            const requirements = (call.requirements || {}) as Record<string, any>;

                            return (
                                <article key={call.id} className="card card-hover flex h-full flex-col">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="text-2xl font-semibold text-[var(--text)]">{call.title}</h2>
                                                {hasApplied ? <span className="badge badge-info">Applied</span> : null}
                                            </div>
                                            <p className="mt-2 text-sm text-[var(--muted)]">
                                                {call.castingProfile?.companyName || 'Casting team'}
                                            </p>
                                        </div>
                                        {call.castingProfile?.verified ? (
                                            <span className="badge badge-success">Verified</span>
                                        ) : (
                                            <span className="badge badge-neutral">
                                                {call.castingProfile?.verificationStatus === 'pending' ? 'Verification pending' : 'Open listing'}
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-5 flex-1 text-sm leading-7 text-[var(--muted)]">
                                        {call.description || 'Role brief will appear here once the team fills in more context.'}
                                    </p>

                                    <div className="mt-5 flex flex-wrap gap-2">
                                        <span className="badge badge-neutral">Fit {fit.score}%</span>
                                        {call.projectType ? <span className="badge badge-neutral">{call.projectType}</span> : null}
                                        {requirements.age_range ? (
                                            <span className="badge badge-neutral">
                                                Age {String(requirements.age_range.min)}-{String(requirements.age_range.max)}
                                            </span>
                                        ) : null}
                                        {requirements.location ? (
                                            <span className="badge badge-neutral">{String(requirements.location)}</span>
                                        ) : null}
                                    </div>

                                    {call.submissionChecklist?.length ? (
                                        <div className="mt-5 rounded-[1.25rem] border border-white/8 bg-white/3 p-4">
                                            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Submission checklist</p>
                                            <ul className="mt-3 space-y-2 text-sm text-[var(--text)]">
                                                {call.submissionChecklist.slice(0, 3).map((item) => (
                                                    <li key={item}>• {item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : null}

                                    <div className="mt-6 flex items-center justify-between gap-3">
                                        <div className="text-sm text-[var(--muted)]">
                                            {call.deadline ? `Deadline ${new Date(call.deadline).toLocaleDateString()}` : 'Rolling review'}
                                        </div>
                                        <Link href={`/actor/casting-calls/${call.id}`} className="btn btn-primary">
                                            View details
                                        </Link>
                                    </div>
                                </article>
                            );
                        })
                    ) : (
                        <div className="card md:col-span-2 xl:col-span-3">
                            <h2 className="font-[var(--font-serif)] text-3xl">No active casting calls right now</h2>
                            <p className="mt-3 text-[var(--muted)]">New opportunities will appear here as verified teams open submissions.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
