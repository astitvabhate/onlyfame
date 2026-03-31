import Link from 'next/link';
import { DashboardNav } from '@/components/DashboardNav';
import { ProgressChecklist } from '@/components/ProgressChecklist';
import { StatusBadge } from '@/components/StatusBadge';
import { getCastingCallChecklist } from '@/lib/workflows';
import { requireRole } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export default async function CasterDashboard() {
    const user = await requireRole('caster');
    const castingCalls = user.castingProfile
        ? await prisma.castingCall.findMany({
              where: { casterId: user.castingProfile.id },
              orderBy: { createdAt: 'desc' },
          })
        : [];

    const recentApplications = user.castingProfile
        ? await prisma.application.findMany({
              where: {
                  castingCall: {
                      casterId: user.castingProfile.id,
                  },
              },
              include: {
                  castingCall: true,
                  actorProfile: {
                      include: {
                          user: true,
                      },
                  },
              },
              orderBy: { createdAt: 'desc' },
              take: 5,
          })
        : [];

    const openCalls = castingCalls.filter((call) => call.isActive);
    const reviewBacklog = recentApplications.filter((application) => application.status === 'applied').length;
    const featuredCall = castingCalls[0];
    const featuredCallChecklist = featuredCall
        ? getCastingCallChecklist({
              ...featuredCall,
              requirements: (featuredCall.requirements || {}) as any,
              caster_id: featuredCall.casterId,
              sample_script_url: featuredCall.sampleScriptUrl,
              voice_note_url: featuredCall.voiceNoteUrl,
              project_type: featuredCall.projectType,
              shoot_location: featuredCall.shootLocation,
              compensation_details: featuredCall.compensationDetails,
              audition_instructions: featuredCall.auditionInstructions,
              submission_checklist: featuredCall.submissionChecklist,
          } as any)
        : { percent: 0, checks: [{ label: 'Create your first call', done: false }] };

    return (
        <div className="page-shell">
            <DashboardNav role="caster" userName={user.fullName || user.castingProfile?.companyName || 'Caster'} />

            <main className="page-container py-8">
                <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
                    <section className="space-y-8">
                        <div className="card">
                            <p className="section-label">Casting overview</p>
                            <h1 className="mt-3 font-[var(--font-serif)] text-4xl">
                                {user.castingProfile?.companyName || user.fullName || 'Your team'} now has a sharper review workspace.
                            </h1>
                            <p className="mt-4 max-w-2xl text-[var(--muted)]">
                                Publish clearer briefs, review stronger submissions, and keep every application stage visible without chasing context across tools.
                            </p>
                            <div className="mt-8 grid gap-4 md:grid-cols-3">
                                <div className="metric">
                                    <p className="metric-label">Active calls</p>
                                    <p className="metric-value">{openCalls.length}</p>
                                    <p className="metric-note">Roles currently accepting submissions.</p>
                                </div>
                                <div className="metric">
                                    <p className="metric-label">Review backlog</p>
                                    <p className="metric-value">{reviewBacklog}</p>
                                    <p className="metric-note">Applications still in first review.</p>
                                </div>
                                <div className="metric">
                                    <p className="metric-label">Verification</p>
                                    <p className="metric-value text-2xl">
                                        {user.castingProfile?.verified ? 'Verified' : user.castingProfile?.verificationStatus === 'pending' ? 'Pending' : 'Start trust setup'}
                                    </p>
                                    <p className="metric-note">Visible trust cues improve actor confidence.</p>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="section-label">Recent applicants</p>
                                    <h2 className="mt-3 panel-title">Submissions that need attention</h2>
                                </div>
                                <Link href="/caster/applications" className="btn btn-secondary">
                                    Open review workspace
                                </Link>
                            </div>

                            <div className="mt-6 space-y-4">
                                {recentApplications.length > 0 ? (
                                    recentApplications.map((application) => (
                                        <div key={application.id} className="rounded-[1.5rem] border border-white/8 bg-white/3 p-5">
                                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <p className="text-lg font-semibold text-[var(--text)]">
                                                            {application.actorProfile?.user.fullName || 'Actor'}
                                                        </p>
                                                        <StatusBadge status={application.status as any} />
                                                    </div>
                                                    <p className="mt-2 text-sm text-[var(--muted)]">
                                                        {application.castingCall?.title} · {application.actorProfile?.location || 'Location not listed'}
                                                    </p>
                                                </div>
                                                <Link href="/caster/applications" className="btn btn-ghost">
                                                    Review
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-[1.5rem] border border-white/8 bg-white/3 p-6 text-sm text-[var(--muted)]">
                                        Applications will appear here once actors start submitting.
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <aside className="space-y-8">
                        <div className="card">
                            <p className="section-label">Trust posture</p>
                            <h2 className="mt-3 panel-title">What actors see before they submit</h2>
                            <div className="mt-5 space-y-3">
                                <div className="rounded-[1.25rem] border border-white/8 bg-white/3 px-4 py-3 text-sm text-[var(--text)]">
                                    {user.castingProfile?.verified ? 'Company identity is verified.' : 'Add trust details to improve response quality.'}
                                </div>
                                <div className="rounded-[1.25rem] border border-white/8 bg-white/3 px-4 py-3 text-sm text-[var(--text)]">
                                    {user.castingProfile?.website ? 'Public company website is visible on casting calls.' : 'Add a public website or portfolio link.'}
                                </div>
                                <div className="rounded-[1.25rem] border border-white/8 bg-white/3 px-4 py-3 text-sm text-[var(--text)]">
                                    Protected contact sharing happens only after selection.
                                </div>
                            </div>
                        </div>

                        <ProgressChecklist
                            title="Lead call quality"
                            percent={featuredCallChecklist.percent}
                            items={featuredCallChecklist.checks}
                            note={featuredCall ? 'Use your latest call as the quality benchmark for future briefs.' : 'Create a detailed first call to activate the hiring flow.'}
                        />

                        <div className="card">
                            <p className="section-label">Next step</p>
                            <h2 className="mt-3 panel-title">Keep the pipeline moving</h2>
                            <p className="mt-3 text-sm text-[var(--muted)]">
                                The strongest improvements now come from sharper role briefs and faster first-round review.
                            </p>
                            <div className="mt-6 flex flex-col gap-3">
                                <Link href="/caster/create-call" className="btn btn-primary">
                                    Create a stronger call
                                </Link>
                                <Link href="/caster/calls" className="btn btn-secondary">
                                    Manage existing calls
                                </Link>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
