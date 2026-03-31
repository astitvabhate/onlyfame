import Link from 'next/link';
import { DashboardNav } from '@/components/DashboardNav';
import { ProgressChecklist } from '@/components/ProgressChecklist';
import { StatusBadge } from '@/components/StatusBadge';
import { computeActorFit, getActorProfileChecklist, getApplicationStatusCopy } from '@/lib/workflows';
import { requireRole } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export default async function ActorDashboard() {
    const user = await requireRole('actor');
    const actorProfile = await prisma.actorProfile.findUnique({
        where: { userId: user.id },
        include: { images: true },
    });

    const applications = actorProfile
        ? await prisma.application.findMany({
              where: { actorId: actorProfile.id },
              include: {
                  castingCall: {
                      include: {
                          castingProfile: true,
                      },
                  },
              },
              orderBy: { createdAt: 'desc' },
              take: 4,
          })
        : [];

    const openCalls = await prisma.castingCall.findMany({
        where: { isActive: true },
        include: { castingProfile: true },
        orderBy: { createdAt: 'desc' },
        take: 6,
    });

    const notifications = await prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
    });

    const checklist = getActorProfileChecklist(
        actorProfile
            ? {
                  ...actorProfile,
                  user_id: actorProfile.userId,
                  past_works: actorProfile.pastWorks as any[],
              }
            : null,
        (actorProfile?.images || []).map((image) => ({ ...image, actor_id: image.actorId, image_url: image.imageUrl }))
    );
    const appliedIds = new Set(applications.map((app) => app.castingCallId));

    const recommendedCalls = openCalls
        .filter((call) => !appliedIds.has(call.id))
        .map((call) => ({
            ...call,
            fit: computeActorFit(
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
            ),
        }))
        .sort((a, b) => b.fit.score - a.fit.score)
        .slice(0, 3);

    const selectedCount = applications.filter((application) => application.status === 'selected').length;
    const shortlistedCount = applications.filter((application) => application.status === 'shortlisted').length;

    return (
        <div className="page-shell">
            <DashboardNav role="actor" userName={user.fullName || 'Actor'} />

            <main className="page-container py-8">
                <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
                    <section className="space-y-8">
                        <div className="card">
                            <p className="section-label">Actor overview</p>
                            <h1 className="mt-3 font-[var(--font-serif)] text-4xl">
                                {user.fullName ? `${user.fullName.split(' ')[0]}, keep your next audition moving.` : 'Keep your next audition moving.'}
                            </h1>
                            <p className="mt-4 max-w-2xl text-[var(--muted)]">
                                Use this workspace to finish your profile, find calls that match your profile, and keep every application in view.
                            </p>
                            <div className="mt-8 grid gap-4 md:grid-cols-3">
                                <div className="metric">
                                    <p className="metric-label">Readiness</p>
                                    <p className="metric-value">{checklist.percent}%</p>
                                    <p className="metric-note">{checklist.readyToApply ? 'Ready to apply' : 'Still needs setup'}</p>
                                </div>
                                <div className="metric">
                                    <p className="metric-label">Shortlisted</p>
                                    <p className="metric-value">{shortlistedCount}</p>
                                    <p className="metric-note">Active opportunities still in review.</p>
                                </div>
                                <div className="metric">
                                    <p className="metric-label">Selected</p>
                                    <p className="metric-value">{selectedCount}</p>
                                    <p className="metric-note">Roles or next steps confirmed.</p>
                                </div>
                            </div>
                        </div>

                        <ProgressChecklist
                            title="Profile activation checklist"
                            percent={checklist.percent}
                            items={checklist.checks}
                            note="Casting teams see the strongest first impression when your basics, story, and headshots are all in place."
                        />

                        <div className="card">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="section-label">Recommended calls</p>
                                    <h2 className="mt-3 panel-title">Roles that fit your current profile</h2>
                                </div>
                                <Link href="/actor/casting-calls" className="btn btn-secondary">
                                    Explore all calls
                                </Link>
                            </div>

                            <div className="mt-6 space-y-4">
                                {recommendedCalls.length > 0 ? (
                                    recommendedCalls.map((call) => (
                                        <div key={call.id} className="rounded-[1.5rem] border border-white/8 bg-white/3 p-5">
                                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="text-xl font-semibold text-[var(--text)]">{call.title}</h3>
                                                        {call.castingProfile?.verified ? <span className="badge badge-success">Verified team</span> : null}
                                                    </div>
                                                    <p className="mt-2 text-sm text-[var(--muted)]">
                                                        {call.castingProfile?.companyName || 'Casting team'} · Fit score {call.fit.score}%
                                                    </p>
                                                    {call.fit.reasons.length ? (
                                                        <p className="mt-3 text-sm text-[var(--text)]">{call.fit.reasons.join(' • ')}</p>
                                                    ) : null}
                                                </div>
                                                <div className="flex flex-col items-start gap-3 md:items-end">
                                                    {call.deadline ? (
                                                        <span className="badge badge-neutral">
                                                            Deadline {new Date(call.deadline).toLocaleDateString()}
                                                        </span>
                                                    ) : (
                                                        <span className="badge badge-neutral">Rolling review</span>
                                                    )}
                                                    <Link href={`/actor/casting-calls/${call.id}`} className="btn btn-primary">
                                                        Review call
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-[1.5rem] border border-white/8 bg-white/3 p-6 text-[var(--muted)]">
                                        No fresh calls are available right now. Keep your profile sharp and check back soon.
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <aside className="space-y-8">
                        <div className="card">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="section-label">Recent submissions</p>
                                    <h2 className="mt-3 panel-title">Where your auditions stand</h2>
                                </div>
                                <Link href="/actor/applications" className="btn btn-ghost">
                                    View all
                                </Link>
                            </div>

                            <div className="mt-6 space-y-4">
                                {applications.length > 0 ? (
                                    applications.map((application) => {
                                        const status = getApplicationStatusCopy(application.status as any);

                                        return (
                                            <div key={application.id} className="rounded-[1.5rem] border border-white/8 bg-white/3 p-5">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                        <p className="text-base font-semibold text-[var(--text)]">
                                                            {application.castingCall?.title}
                                                        </p>
                                                        <p className="mt-1 text-sm text-[var(--muted)]">
                                                            {application.castingCall?.castingProfile?.companyName || 'Casting team'}
                                                        </p>
                                                    </div>
                                                    <StatusBadge status={application.status as any} />
                                                </div>
                                                <p className="mt-3 text-sm text-[var(--muted)]">{status.note}</p>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="rounded-[1.5rem] border border-white/8 bg-white/3 p-6 text-sm text-[var(--muted)]">
                                        You have not submitted any auditions yet.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="card">
                            <p className="section-label">Signals</p>
                            <h2 className="mt-3 panel-title">Notifications and trust updates</h2>
                            <div className="mt-6 space-y-3">
                                {notifications.length > 0 ? (
                                    notifications.map((notification) => (
                                        <div key={notification.id} className="rounded-[1.25rem] border border-white/8 bg-white/3 px-4 py-4">
                                            <p className="text-sm font-semibold text-[var(--text)]">{notification.title}</p>
                                            <p className="mt-1 text-sm text-[var(--muted)]">{notification.message}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-[1.5rem] border border-white/8 bg-white/3 p-6 text-sm text-[var(--muted)]">
                                        No new notifications. Status changes and trust updates will appear here.
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
