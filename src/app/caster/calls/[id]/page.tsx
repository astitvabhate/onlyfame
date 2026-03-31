import Link from 'next/link';
import { redirect } from 'next/navigation';
import { DashboardNav } from '@/components/DashboardNav';
import { StatusBadge } from '@/components/StatusBadge';
import { getCastingCallChecklist } from '@/lib/workflows';
import { requireRole } from '@/lib/session';
import { prisma } from '@/lib/prisma';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function CasterCallDetailPage({ params }: PageProps) {
    const { id } = await params;
    const user = await requireRole('caster');

    const castingCall = user.castingProfile
        ? await prisma.castingCall.findFirst({
              where: {
                  id,
                  casterId: user.castingProfile.id,
              },
          })
        : null;

    if (!castingCall) {
        redirect('/caster/calls');
    }

    const applications = await prisma.application.findMany({
        where: { castingCallId: id },
        include: {
            actorProfile: {
                include: {
                    user: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    const readiness = getCastingCallChecklist({
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
    } as any);
    const statusCounts = {
        applied: applications.filter((application) => application.status === 'applied').length,
        shortlisted: applications.filter((application) => application.status === 'shortlisted').length,
        selected: applications.filter((application) => application.status === 'selected').length,
        rejected: applications.filter((application) => application.status === 'rejected').length,
    };

    return (
        <div className="page-shell">
            <DashboardNav role="caster" userName={user.fullName || 'Caster'} />

            <main className="page-container py-8">
                <Link href="/caster/calls" className="btn btn-ghost px-0">
                    Back to all calls
                </Link>

                <div className="mt-6 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
                    <section className="space-y-8">
                        <div className="card">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className={`badge ${castingCall.isActive ? 'badge-success' : 'badge-neutral'}`}>
                                            {castingCall.isActive ? 'Open' : 'Closed'}
                                        </span>
                                        <span className="badge badge-neutral">Readiness {readiness.percent}%</span>
                                    </div>
                                    <h1 className="mt-4 font-[var(--font-serif)] text-5xl">{castingCall.title}</h1>
                                    <p className="mt-3 text-[var(--muted)]">
                                        {castingCall.projectType || 'Open project'} · {castingCall.shootLocation || 'Location to be confirmed'}
                                    </p>
                                </div>
                                <Link href="/caster/applications" className="btn btn-primary">
                                    Open review workspace
                                </Link>
                            </div>

                            <p className="mt-8 whitespace-pre-wrap text-base leading-8 text-[var(--text)]">
                                {castingCall.description || 'No role description has been provided.'}
                            </p>

                            {castingCall.auditionInstructions ? (
                                <div className="mt-8 rounded-[1.5rem] border border-white/8 bg-white/3 p-5">
                                    <p className="section-label">Audition direction</p>
                                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--text)]">
                                        {castingCall.auditionInstructions}
                                    </p>
                                </div>
                            ) : null}
                        </div>

                        <div className="card">
                            <div className="grid gap-4 md:grid-cols-4">
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
                    </section>

                    <aside className="space-y-8">
                        <div className="card">
                            <p className="section-label">Checklist</p>
                            <h2 className="mt-3 panel-title">What applicants were asked to submit</h2>
                            <div className="mt-5 space-y-3">
                                {(castingCall.submissionChecklist?.length
                                    ? castingCall.submissionChecklist
                                    : ['No submission checklist has been added yet.']
                                ).map((item) => (
                                    <div key={item} className="rounded-[1.25rem] border border-white/8 bg-white/3 px-4 py-3 text-sm text-[var(--text)]">
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="card">
                            <p className="section-label">Applicants</p>
                            <h2 className="mt-3 panel-title">Recent activity for this call</h2>
                            <div className="mt-5 space-y-3">
                                {applications.length > 0 ? (
                                    applications.map((application) => (
                                        <div key={application.id} className="rounded-[1.25rem] border border-white/8 bg-white/3 px-4 py-4">
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-[var(--text)]">
                                                        {application.actorProfile?.user.fullName || 'Actor'}
                                                    </p>
                                                    <p className="mt-1 text-xs text-[var(--muted)]">
                                                        {application.actorProfile?.location || 'Location not listed'}
                                                    </p>
                                                </div>
                                                <StatusBadge status={application.status as any} />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-[1.25rem] border border-white/8 bg-white/3 px-4 py-4 text-sm text-[var(--muted)]">
                                        No one has applied yet.
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
