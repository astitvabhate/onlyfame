import Link from 'next/link';
import { DashboardNav } from '@/components/DashboardNav';
import { getCastingCallChecklist } from '@/lib/workflows';
import { requireRole } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export default async function CasterCallsPage() {
    const user = await requireRole('caster');
    const castingCalls = user.castingProfile
        ? await prisma.castingCall.findMany({
              where: { casterId: user.castingProfile.id },
              orderBy: { createdAt: 'desc' },
          })
        : [];

    const applicationCounts = user.castingProfile
        ? await prisma.application.findMany({
              where: {
                  castingCall: {
                      casterId: user.castingProfile.id,
                  },
              },
              select: {
                  castingCallId: true,
                  status: true,
              },
          })
        : [];

    const countsMap = applicationCounts.reduce((acc, application) => {
        const current = acc[application.castingCallId] || { total: 0, shortlisted: 0 };
        current.total += 1;
        if (application.status === 'shortlisted') current.shortlisted += 1;
        acc[application.castingCallId] = current;
        return acc;
    }, {} as Record<string, { total: number; shortlisted: number }>);

    return (
        <div className="page-shell">
            <DashboardNav role="caster" userName={user.fullName || user.castingProfile?.companyName || 'Caster'} />

            <main className="page-container py-8">
                <div className="card">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="section-label">Casting calls</p>
                            <h1 className="mt-3 font-[var(--font-serif)] text-4xl">Manage role briefs and keep your pipeline healthy</h1>
                            <p className="mt-3 max-w-2xl text-[var(--muted)]">
                                Each call should set the tone for trust, fit, and submission quality. Review weak briefs before they create weak pipelines.
                            </p>
                        </div>
                        <Link href="/caster/create-call" className="btn btn-primary">
                            Create new call
                        </Link>
                    </div>
                </div>

                <div className="mt-8 space-y-4">
                    {castingCalls.length > 0 ? (
                        castingCalls.map((call) => {
                            const readiness = getCastingCallChecklist({
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
                            } as any);
                            const counts = countsMap[call.id] || { total: 0, shortlisted: 0 };

                            return (
                                <article key={call.id} className="card">
                                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="max-w-3xl">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h2 className="text-2xl font-semibold text-[var(--text)]">{call.title}</h2>
                                                <span className={`badge ${call.isActive ? 'badge-success' : 'badge-neutral'}`}>
                                                    {call.isActive ? 'Open' : 'Closed'}
                                                </span>
                                                <span className="badge badge-neutral">Readiness {readiness.percent}%</span>
                                            </div>
                                            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                                                {call.description || 'No role description has been added yet.'}
                                            </p>
                                            <div className="mt-5 flex flex-wrap gap-2">
                                                {call.projectType ? <span className="badge badge-neutral">{call.projectType}</span> : null}
                                                {call.shootLocation ? <span className="badge badge-neutral">{call.shootLocation}</span> : null}
                                                <span className="badge badge-neutral">{counts.total} applicants</span>
                                                <span className="badge badge-neutral">{counts.shortlisted} shortlisted</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-start gap-3 lg:items-end">
                                            <p className="text-sm text-[var(--muted)]">
                                                {call.deadline ? `Deadline ${new Date(call.deadline).toLocaleDateString()}` : 'Rolling review'}
                                            </p>
                                            <Link href={`/caster/calls/${call.id}`} className="btn btn-secondary">
                                                Open call workspace
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            );
                        })
                    ) : (
                        <div className="card text-center">
                            <h2 className="font-[var(--font-serif)] text-3xl">No casting calls yet</h2>
                            <p className="mt-3 text-[var(--muted)]">Create your first call to activate the talent pipeline.</p>
                            <Link href="/caster/create-call" className="btn btn-primary mt-8">
                                Create first call
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
